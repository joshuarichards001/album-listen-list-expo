import { DarkTheme, type Theme } from "expo-router";

import { useCSSVariable } from "@/tw";

export function useNavigationTheme(): Theme {
  const background = useCSSVariable("--color-background-base");
  const text = useCSSVariable("--color-text-base");
  const border = useCSSVariable("--color-background-highlight");
  const notification = useCSSVariable("--color-spotify-green");
  const fontFamily = useCSSVariable("--font-gotham");

  return {
    dark: true,
    colors: { primary: text, background, card: background, text, border, notification },
    fonts: {
      regular: { ...DarkTheme.fonts.regular, fontFamily },
      medium: { ...DarkTheme.fonts.medium, fontFamily },
      bold: { ...DarkTheme.fonts.bold, fontFamily },
      heavy: { ...DarkTheme.fonts.heavy, fontFamily },
    },
  };
}
