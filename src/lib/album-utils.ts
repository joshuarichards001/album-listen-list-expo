import type { Album } from "@/lib/queries/albums";

export const SORT_FIELDS = [
  "time_added",
  "name",
  "artist_name",
  "release_date",
  "rating",
  "review_date",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type AlbumFilter = "all" | "not-reviewed" | "reviewed";
export type ViewMode = "list" | "grid";

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

const isDateField = (field: SortField) =>
  field === "time_added" || field === "release_date" || field === "review_date";

const isDescendingByDefault = (field: SortField) => field === "rating" || isDateField(field);

export const getNextSort = (
  field: SortField,
  currentField: SortField,
  currentAscending: boolean,
) =>
  field === currentField
    ? { sortField: field, sortAscending: !currentAscending }
    : { sortField: field, sortAscending: !isDescendingByDefault(field) };

const compareValues = (field: SortField, a: string | number, b: string | number) => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  // The numeric collator compares fractional seconds as integers (".5" < ".123456").
  if (isDateField(field)) return `${a}` < `${b}` ? -1 : 1;
  return collator.compare(`${a}`, `${b}`);
};

export const sortAlbums = (albums: Album[], field: SortField, ascending: boolean) =>
  [...albums].sort((first, second) => {
    const a = first[field];
    const b = second[field];
    if (a === b) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    const result = compareValues(field, a, b);
    return ascending ? result : -result;
  });

export const filterAlbums = (albums: Album[], filter: AlbumFilter) => {
  if (filter === "not-reviewed") return albums.filter((album) => !album.rating);
  if (filter === "reviewed") return albums.filter((album) => !!album.rating);
  return albums;
};

export const searchAlbums = (albums: Album[], search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return albums;
  return albums.filter(
    (album) =>
      album.name.toLowerCase().includes(query) || album.artist_name.toLowerCase().includes(query),
  );
};

export const getRandomAlbum = (albums: Album[]) =>
  albums[Math.floor(Math.random() * albums.length)];

export const getSpotifyAlbumUrl = (spotifyId: string) =>
  `https://open.spotify.com/album/${spotifyId}`;
