import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/lib/supabase";
import { useRootStore } from "@/stores/root-store";

const redirectTo = Linking.createURL("");

const getAuthParams = (url: string) => {
  const [base = "", fragment = ""] = url.split("#");
  const query = base.split("?")[1] ?? "";
  return new URLSearchParams(`${query}&${fragment}`);
};

export const signInWithSpotify = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "spotify",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return;

  const params = getAuthParams(result.url);
  const authError = params.get("error_description") ?? params.get("error");
  if (authError) throw new Error(authError);

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const spotifyAccessToken = params.get("provider_token");
  const spotifyRefreshToken = params.get("provider_refresh_token");
  if (!accessToken || !refreshToken || !spotifyAccessToken || !spotifyRefreshToken) {
    throw new Error("Spotify sign in did not return all the expected tokens.");
  }

  useRootStore.getState().setSpotifyTokens({
    accessToken: spotifyAccessToken,
    refreshToken: spotifyRefreshToken,
  });

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw sessionError;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
