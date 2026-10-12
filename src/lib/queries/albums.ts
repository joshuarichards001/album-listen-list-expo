import { mutationOptions, queryOptions } from "@tanstack/react-query";

import type { Tables } from "@/lib/database.types";
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
