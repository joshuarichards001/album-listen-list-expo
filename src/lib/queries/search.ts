import { type InfiniteData, infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";

import {
  SEARCH_PAGE_SIZE,
  searchSpotifyAlbums,
  type SpotifyAlbum,
  type SpotifyAlbumPage,
  SpotifyError,
} from "@/lib/spotify";

const MAX_QUERY_LENGTH = 100;
const MAX_SEARCH_OFFSET = 1000;
const MAX_RETRIES = 2;
const MAX_RETRY_AFTER_MS = 5000;

export const spotifyKeys = {
  all: ["spotify"] as const,
  search: (query: string) => ["spotify", "search", query] as const,
};

export const normaliseSearchQuery = (text: string) =>
  text.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH).trim().toLowerCase();

const getNextOffset = (page: SpotifyAlbumPage) => {
  const next = page.offset + page.limit;
  return next < page.total && next + SEARCH_PAGE_SIZE <= MAX_SEARCH_OFFSET ? next : undefined;
};

const flattenPages = (data: InfiniteData<SpotifyAlbumPage, number>) => {
  const seen = new Set<string>();
  const albums: SpotifyAlbum[] = [];
  for (const album of data.pages.flatMap((page) => page.items)) {
    if (seen.has(album.id)) continue;
    seen.add(album.id);
    albums.push(album);
  }
  return albums;
};

const isRetryable = (error: Error) => {
  if (!(error instanceof SpotifyError)) return false;
  if (error.status === null || error.status >= 500) return true;
  return (
    error.status === 429 && error.retryAfterMs !== null && error.retryAfterMs <= MAX_RETRY_AFTER_MS
  );
};

const getRetryDelay = (failureCount: number, error: Error) =>
  error instanceof SpotifyError && error.status === 429 && error.retryAfterMs !== null
    ? error.retryAfterMs
    : Math.min(1000 * 2 ** failureCount, 30_000);

export const searchAlbumsInfiniteQueryOptions = (query: string) =>
  infiniteQueryOptions({
    queryKey: spotifyKeys.search(query),
    queryFn: ({ pageParam, signal }) => searchSpotifyAlbums({ query, offset: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: getNextOffset,
    select: flattenPages,
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryable(error),
    retryDelay: getRetryDelay,
  });
