import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export type SpotifyAlbum = {
  id: string;
  name: string;
  artistName: string;
  releaseYear: string | null;
  albumType: string;
  coverUrl: string | null;
};

export type SpotifyAlbumPage = {
  items: SpotifyAlbum[];
  offset: number;
  limit: number;
  total: number;
};

export class SpotifyError extends Error {
  readonly status: number | null;
  readonly retryAfterMs: number | null;

  constructor(message: string, status: number | null, retryAfterMs: number | null = null) {
    super(message);
    this.name = "SpotifyError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

type AppToken = { accessToken: string; expiresAt: number };

export const SEARCH_PAGE_SIZE = 20;
const TOKEN_MIN_LIFETIME_MS = 60_000;
const TOKEN_TIMEOUT_MS = 10_000;

let cachedToken: AppToken | null = null;
let pendingToken: Promise<AppToken> | null = null;
let tokenGeneration = 0;

const isAppToken = (value: unknown): value is AppToken =>
  typeof value === "object" &&
  value !== null &&
  "accessToken" in value &&
  typeof value.accessToken === "string" &&
  "expiresAt" in value &&
  typeof value.expiresAt === "number";

const fetchAppToken = async () => {
  const { data, error } = await supabase.functions.invoke<unknown>("spotify-token", {
    timeout: TOKEN_TIMEOUT_MS,
  });
  if (error) {
    const status = error instanceof FunctionsHttpError ? error.context.status : null;
    throw new SpotifyError("Couldn't connect to Spotify. Try again in a moment.", status);
  }
  if (!isAppToken(data)) {
    throw new SpotifyError("Couldn't connect to Spotify. Try again in a moment.", 502);
  }
  return data;
};

export const getSpotifyAppToken = (): Promise<AppToken> => {
  if (cachedToken && cachedToken.expiresAt - Date.now() > TOKEN_MIN_LIFETIME_MS) {
    return Promise.resolve(cachedToken);
  }

  if (!pendingToken) {
    const generation = tokenGeneration;
    pendingToken = fetchAppToken()
      .then((token) => {
        if (generation === tokenGeneration) cachedToken = token;
        return token;
      })
      .finally(() => {
        if (generation === tokenGeneration) pendingToken = null;
      });
  }
  return pendingToken;
};

export const clearSpotifyAppToken = () => {
  tokenGeneration += 1;
  cachedToken = null;
  pendingToken = null;
};

const discardAppToken = (token: AppToken) => {
  if (cachedToken?.accessToken === token.accessToken) cachedToken = null;
};

type RawSpotifyAlbum = {
  id: string;
  name: string;
  album_type?: string;
  release_date?: string;
  artists?: { name?: string }[];
  images?: { url: string; width?: number | null }[];
};

const isRawSpotifyAlbum = (item: unknown): item is RawSpotifyAlbum =>
  typeof item === "object" &&
  item !== null &&
  "id" in item &&
  typeof item.id === "string" &&
  "name" in item &&
  typeof item.name === "string";

const toSpotifyAlbum = (album: RawSpotifyAlbum): SpotifyAlbum => {
  const images = album.images ?? [];
  const cover = images.find((image) => image.width === 300) ?? images[0];
  const artistNames = (album.artists ?? []).flatMap((artist) => artist.name ?? []);
  return {
    id: album.id,
    name: album.name,
    artistName: artistNames.join(", ") || "Unknown Artist",
    releaseYear: album.release_date?.slice(0, 4) || null,
    albumType: album.album_type ?? "album",
    coverUrl: cover?.url ?? null,
  };
};

const getRetryAfterMs = (response: Response) => {
  const seconds = Number(response.headers.get("Retry-After"));
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : null;
};

const toSpotifyError = (response: Response) => {
  if (response.status === 429) {
    return new SpotifyError(
      "Spotify is busy, try again in a moment.",
      429,
      getRetryAfterMs(response),
    );
  }
  if (response.status >= 500) {
    return new SpotifyError("Spotify isn't responding. Try again in a moment.", response.status);
  }
  return new SpotifyError("Spotify couldn't run this search.", response.status);
};

type SearchParams = { query: string; offset: number; signal?: AbortSignal };

const requestSearch = async ({ query, offset, signal }: SearchParams, token: AppToken) => {
  const params = new URLSearchParams({
    q: query,
    type: "album",
    limit: `${SEARCH_PAGE_SIZE}`,
    offset: `${offset}`,
  });
  try {
    return await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new SpotifyError("Couldn't reach Spotify. Check your connection.", null);
  }
};

export const searchSpotifyAlbums = async (params: SearchParams): Promise<SpotifyAlbumPage> => {
  let token = await getSpotifyAppToken();
  let response = await requestSearch(params, token);
  if (response.status === 401) {
    discardAppToken(token);
    token = await getSpotifyAppToken();
    response = await requestSearch(params, token);
  }
  if (!response.ok) throw toSpotifyError(response);

  const body = await response.json().catch(() => null);
  const albums = body?.albums;
  if (!albums || !Array.isArray(albums.items)) {
    throw new SpotifyError("Spotify returned an unexpected response.", 502);
  }

  return {
    items: albums.items.filter(isRawSpotifyAlbum).map(toSpotifyAlbum),
    offset: typeof albums.offset === "number" ? albums.offset : params.offset,
    limit: typeof albums.limit === "number" ? albums.limit : SEARCH_PAGE_SIZE,
    total: typeof albums.total === "number" ? albums.total : 0,
  };
};
