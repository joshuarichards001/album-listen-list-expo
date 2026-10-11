import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import "@/global.css";
import { useSupabaseAuthListener } from "@/hooks/use-supabase-auth-listener";
import { useRootStore } from "@/stores/root-store";
import { useCSSVariable } from "@/tw";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSupabaseAuthListener();
  const isAuthLoaded = useRootStore((state) => state.isAuthLoaded);
  const [fontsLoaded, fontError] = useFonts({
    "Gotham-Medium": require("../../assets/fonts/Gotham-Medium.otf"),
  });
  const isReady = isAuthLoaded && (fontsLoaded || fontError !== null);
  const isSignedIn = useRootStore((state) => state.session !== null);
  const backgroundColor = useCSSVariable("--color-background-base");
  const foregroundColor = useCSSVariable("--color-text-base");
  const fontFamily = useCSSVariable("--font-gotham");

  useEffect(() => {
    if (isReady) SplashScreen.hide();
  }, [isReady]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor },
          headerTintColor: foregroundColor,
          headerTitleStyle: { fontFamily },
          headerShadowVisible: false,
          contentStyle: { backgroundColor },
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
