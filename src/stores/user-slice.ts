import type { StateCreator } from "zustand";

import type { RootState } from "@/stores/root-store";

export type UserSlice = {
  id: string;
  setUserId: (id: string) => void;
};

export const createUserSlice: StateCreator<
  RootState,
  [["zustand/persist", unknown]],
  [],
  UserSlice
> = (set) => ({
  id: "",
  setUserId: (id) => set({ id }),
});
