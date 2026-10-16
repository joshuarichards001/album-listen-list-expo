import { FunctionRegion } from "@supabase/supabase-js";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";

import type { Tables } from "@/lib/database.types";
import type { SpotifyAlbum } from "@/lib/spotify";
import { supabase } from "@/lib/supabase";

type AlbumRow = Tables<"albums_and_reviews_in_list">;

export type Album = AlbumRow & {
  id: number;
  name: string;
  artist_name: string;
  list_id: number;
  time_added: string;
};

const CHUNK_SIZE = 1000;

export const albumKeys = {
  list: (listId: number) => ["albums", listId] as const,
};

const isAlbum = (row: AlbumRow): row is Album =>
  row.id !== null &&
  row.name !== null &&
  row.artist_name !== null &&
  row.list_id !== null &&
  row.time_added !== null;

const fetchChunk = async (listId: number, from: number) => {
  const { data, error, count } = await supabase
    .from("albums_and_reviews_in_list")
    .select("*", { count: from === 0 ? "exact" : undefined })
    .eq("list_id", listId)
    .order("time_added")
    .order("id")
    .range(from, from + CHUNK_SIZE - 1);
  if (error) throw error;
  return { rows: data, count };
};

const fetchAlbums = async (listId: number) => {
  const first = await fetchChunk(listId, 0);
  const total = first.count ?? first.rows.length;
  const starts: number[] = [];
  for (let from = CHUNK_SIZE; from < total; from += CHUNK_SIZE) starts.push(from);
  const rest = await Promise.all(starts.map((from) => fetchChunk(listId, from)));
  return [first, ...rest].flatMap((chunk) => chunk.rows).filter(isAlbum);
};

export const albumsQueryOptions = (listId: number) =>
  queryOptions({
    queryKey: albumKeys.list(listId),
    queryFn: () => fetchAlbums(listId),
  });

type RemoveAlbumVariables = { listId: number; albumId: number };

const removeAlbumMutationKey = ["removeAlbum"];

export const removeAlbumMutationOptions = mutationOptions({
  mutationKey: removeAlbumMutationKey,
  mutationFn: async ({ listId, albumId }: RemoveAlbumVariables) => {
    const { error } = await supabase
      .from("list_albums")
      .delete()
      .eq("list_id", listId)
      .eq("album_id", albumId);
    if (error) throw error;
  },
  onMutate: async ({ listId, albumId }, { client }) => {
    const { queryKey } = albumsQueryOptions(listId);
    await client.cancelQueries({ queryKey });
    const removed = client.getQueryData(queryKey)?.find((album) => album.id === albumId);
    client.setQueryData(queryKey, (albums) => albums?.filter((album) => album.id !== albumId));
    return { removed };
  },
  onError: (_error, { listId }, result, { client }) => {
    const removed = result?.removed;
    if (!removed) return;
    client.setQueryData(albumsQueryOptions(listId).queryKey, (albums) =>
      albums && !albums.some((album) => album.id === removed.id) ? [...albums, removed] : albums,
    );
  },
  onSettled: (_data, _error, { listId }, _result, { client }) => {
    // A refetch while another remove is in flight would bring that album back until it settles.
    if (client.isMutating({ mutationKey: removeAlbumMutationKey }) > 1) return;
    return client.invalidateQueries({ queryKey: albumKeys.list(listId) });
  },
});

type AlbumRecord = Tables<"albums">;

const isAlbumRecord = (value: unknown): value is AlbumRecord =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  "name" in value &&
  typeof value.name === "string" &&
  "artist_name" in value &&
  typeof value.artist_name === "string";

const ALBUM_LIMIT_ERROR = "Album limit of 10000 reached";

export const addAlbumMutationKey = ["addAlbum"];

export type AddAlbumVariables = { listId: number; spotifyAlbum: SpotifyAlbum };

const saveAlbum = async (spotifyAlbum: SpotifyAlbum) => {
  const { data, error } = await supabase.functions.invoke<unknown>("add-album", {
    body: { provider: "spotify", provider_id: spotifyAlbum.id },
    region: FunctionRegion.UsEast1,
  });
  if (error) throw new Error("The album couldn't be saved. Try again.");
  const album = typeof data === "object" && data !== null && "album" in data ? data.album : null;
  if (!isAlbumRecord(album)) throw new Error("The album couldn't be saved. Try again.");
  return album;
};

const findCachedReview = (client: QueryClient, albumId: number) => {
  for (const [, albums] of client.getQueriesData<Album[]>({ queryKey: ["albums"] })) {
    const album = albums?.find((a) => a.id === albumId && a.review_date !== null);
    if (album) return { rating: album.rating, note: album.note, review_date: album.review_date };
  }
  return { rating: null, note: null, review_date: null };
};

export const addAlbumMutationOptions = mutationOptions({
  mutationKey: addAlbumMutationKey,
  mutationFn: async ({ listId, spotifyAlbum }: AddAlbumVariables) => {
    const album = await saveAlbum(spotifyAlbum);
    const { data, error } = await supabase
      .from("list_albums")
      .upsert(
        { list_id: listId, album_id: album.id },
        { onConflict: "list_id, album_id", ignoreDuplicates: true },
      )
      .select("time_added");
    if (error) {
      if (error.message.includes(ALBUM_LIMIT_ERROR)) {
        throw new Error("This list has reached its limit of 10,000 albums.");
      }
      throw error;
    }
    const timeAdded = data[0]?.time_added;
    return timeAdded ? { album, timeAdded } : null;
  },
  onSuccess: (added, { listId }, _result, { client }) => {
    const { queryKey } = albumsQueryOptions(listId);
    // Appending while the list is loading would be overwritten by the in-flight response.
    if (!added || client.isFetching({ queryKey }) > 0) {
      return client.invalidateQueries({ queryKey });
    }
    const { album, timeAdded } = added;
    const row: Album = {
      ...album,
      ...findCachedReview(client, album.id),
      list_id: listId,
      time_added: timeAdded,
    };
    client.setQueryData(queryKey, (albums) =>
      albums && !albums.some((a) => a.id === album.id) ? [...albums, row] : albums,
    );
    return client.invalidateQueries({ queryKey, refetchType: "none" });
  },
});
