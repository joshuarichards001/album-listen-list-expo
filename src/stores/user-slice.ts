import type { Session } from "@supabase/supabase-js";
import type { StateCreator } from "zustand";

import { listSignedOutState } from "@/stores/list-slice";
import type { RootState } from "@/stores/root-store";
import { searchSignedOutState } from "@/stores/search-slice";

type SpotifyTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserSlice = {
  session: Session | null;
  isAuthLoaded: boolean;
  id: string;
  spotifyId: string;
  displayName: string;
  profileImage: string;
  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  setSession: (session: Session | null) => void;
  setSpotifyTokens: (tokens: SpotifyTokens) => void;
};

const signedOutState = {
  session: null,
  id: "",
  spotifyId: "",
  displayName: "",
  profileImage: "",
  spotifyAccessToken: "",
  spotifyRefreshToken: "",
} satisfies Partial<UserSlice>;

export const createUserSlice: StateCreator<
  RootState,
  [["zustand/persist", unknown]],
  [],
  UserSlice
> = (set) => ({
  ...signedOutState,
  isAuthLoaded: false,

  setSession: (session) => {
    if (!session) {
      set({
        ...signedOutState,
        ...listSignedOutState,
        ...searchSignedOutState,
        isAuthLoaded: true,
      });
      return;
    }

    const { user } = session;
    set({
      session,
      isAuthLoaded: true,
      id: user.id,
      spotifyId: user.user_metadata.provider_id ?? "",
      displayName: user.user_metadata.full_name ?? user.user_metadata.name ?? "",
      profileImage: user.user_metadata.avatar_url ?? "",
    });
  },
  setSpotifyTokens: ({ accessToken, refreshToken }) =>
    set({
      spotifyAccessToken: accessToken,
      spotifyRefreshToken: refreshToken,
    }),
});

export const partializeUserSlice = ({
  id,
  spotifyId,
  displayName,
  profileImage,
  spotifyAccessToken,
  spotifyRefreshToken,
}: UserSlice) => ({
  id,
  spotifyId,
  displayName,
  profileImage,
  spotifyAccessToken,
  spotifyRefreshToken,
});
