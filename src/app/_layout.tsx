import { useFonts } from "expo-font";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import "@/global.css";
import { useNavigationTheme } from "@/hooks/use-navigation-theme";
import { useSupabaseAuthListener } from "@/hooks/use-supabase-auth-listener";
import { useRootStore } from "@/stores/root-store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useSupabaseAuthListener();
  const isAuthLoaded = useRootStore((state) => state.isAuthLoaded);
  const [fontsLoaded, fontError] = useFonts({
    "Gotham-Medium": require("../../assets/fonts/Gotham-Medium.otf"),
  });
  const isReady = isAuthLoaded && (fontsLoaded || fontError !== null);
  const isSignedIn = useRootStore((state) => state.session !== null);
  const theme = useNavigationTheme();

  useEffect(() => {
    if (isReady) SplashScreen.hide();
  }, [isReady]);

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShadowVisible: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "" }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
