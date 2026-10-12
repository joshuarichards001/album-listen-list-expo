import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { filterAlbums, searchAlbums, sortAlbums } from "@/lib/album-utils";
import { albumsQueryOptions } from "@/lib/queries/albums";
import { useRootStore } from "@/stores/root-store";

export const useVisibleAlbums = (listId: number, search: string) => {
  const query = useQuery(albumsQueryOptions(listId));
  const sortField = useRootStore((state) => state.sortField);
  const sortAscending = useRootStore((state) => state.sortAscending);
  const filter = useRootStore((state) => state.filter);

  const sortedAlbums = useMemo(
    () => sortAlbums(query.data ?? [], sortField, sortAscending),
    [query.data, sortField, sortAscending],
  );
  const visibleAlbums = useMemo(
    () => searchAlbums(filterAlbums(sortedAlbums, filter), search),
    [sortedAlbums, filter, search],
  );

  return { query, visibleAlbums };
};
