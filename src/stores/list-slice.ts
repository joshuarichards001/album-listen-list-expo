import type { StateCreator } from "zustand";

import { type AlbumFilter, getNextSort, type SortField, type ViewMode } from "@/lib/album-utils";
import type { RootState } from "@/stores/root-store";

export type ListSlice = {
  selectedListId: number | null;
  sortField: SortField;
  sortAscending: boolean;
  filter: AlbumFilter;
  viewMode: ViewMode;
  setSelectedListId: (listId: number | null) => void;
  sortBy: (field: SortField) => void;
  setFilter: (filter: AlbumFilter) => void;
  setViewMode: (viewMode: ViewMode) => void;
};

export const listSignedOutState = {
  selectedListId: null,
} satisfies Partial<ListSlice>;

export const createListSlice: StateCreator<
  RootState,
  [["zustand/persist", unknown]],
  [],
  ListSlice
> = (set) => ({
  ...listSignedOutState,
  sortField: "time_added",
  sortAscending: false,
  filter: "all",
  viewMode: "list",

  setSelectedListId: (selectedListId) => set({ selectedListId }),
  sortBy: (field) => set((state) => getNextSort(field, state.sortField, state.sortAscending)),
  setFilter: (filter) => set({ filter }),
  setViewMode: (viewMode) => set({ viewMode }),
});

export const partializeListSlice = ({
  selectedListId,
  sortField,
  sortAscending,
  filter,
  viewMode,
}: ListSlice) => ({
  selectedListId,
  sortField,
  sortAscending,
  filter,
  viewMode,
});
