import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { colors } from "@/constants/colors";
import { useSupabaseAuthListener } from "@/hooks/use-supabase-auth-listener";
import { useRootStore } from "@/stores/root-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSupabaseAuthListener();
  const isAuthLoaded = useRootStore((state) => state.isAuthLoaded);
  const isSignedIn = useRootStore((state) => state.session !== null);

  useEffect(() => {
    if (isAuthLoaded) SplashScreen.hide();
  }, [isAuthLoaded]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
