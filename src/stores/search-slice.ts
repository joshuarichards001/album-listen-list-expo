import type { StateCreator } from "zustand";

import type { RootState } from "@/stores/root-store";

const MAX_RECENT_SEARCHES = 10;

export type SearchSlice = {
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  removeRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
};

export const searchSignedOutState = {
  recentSearches: [],
} satisfies Partial<SearchSlice>;

const isSameSearch = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const createSearchSlice: StateCreator<
  RootState,
  [["zustand/persist", unknown]],
  [],
  SearchSlice
> = (set) => ({
  ...searchSignedOutState,

  addRecentSearch: (search) => {
    const term = search.trim().replace(/\s+/g, " ");
    if (!term) return;
    set((state) => ({
      recentSearches: [
        term,
        ...state.recentSearches.filter((recent) => !isSameSearch(recent, term)),
      ].slice(0, MAX_RECENT_SEARCHES),
    }));
  },
  removeRecentSearch: (search) =>
    set((state) => ({
      recentSearches: state.recentSearches.filter((recent) => recent !== search),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
});

export const partializeSearchSlice = ({ recentSearches }: SearchSlice) => ({ recentSearches });
