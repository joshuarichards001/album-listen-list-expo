import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createListSlice, type ListSlice, partializeListSlice } from "@/stores/list-slice";
import { createSearchSlice, partializeSearchSlice, type SearchSlice } from "@/stores/search-slice";
import { createUserSlice, partializeUserSlice, type UserSlice } from "@/stores/user-slice";

export type RootState = UserSlice & ListSlice & SearchSlice;

export const useRootStore = create<RootState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createListSlice(...a),
      ...createSearchSlice(...a),
    }),
    {
      name: "root-store",
      storage: createJSONStorage(() => ({
        getItem: (name) => Storage.getItemSync(name),
        setItem: (name, value) => Storage.setItem(name, value),
        removeItem: (name) => Storage.removeItem(name),
      })),
      partialize: (state) => ({
        ...partializeUserSlice(state),
        ...partializeListSlice(state),
        ...partializeSearchSlice(state),
      }),
    },
  ),
);
