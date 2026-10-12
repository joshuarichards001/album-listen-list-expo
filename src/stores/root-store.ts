import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createListSlice, type ListSlice, partializeListSlice } from "@/stores/list-slice";
import { createUserSlice, partializeUserSlice, type UserSlice } from "@/stores/user-slice";

export type RootState = UserSlice & ListSlice;

export const useRootStore = create<RootState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createListSlice(...a),
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
      }),
    },
  ),
);
