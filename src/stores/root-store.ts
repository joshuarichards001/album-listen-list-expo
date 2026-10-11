import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createUserSlice,
  partializeUserSlice,
  type UserSlice,
} from "@/stores/user-slice";

export type RootState = UserSlice;

export const useRootStore = create<RootState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
    }),
    {
      name: "root-store",
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({
        ...partializeUserSlice(state),
      }),
    },
  ),
);
