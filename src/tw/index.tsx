import { Image as ExpoImage } from "expo-image";
import type { ComponentProps } from "react";
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  View as RNView,
} from "react-native";
import { type ReactComponent, useCssElement, useNativeVariable } from "react-native-css";

export const useCSSVariable: (variable: string) => string =
  process.env.EXPO_OS !== "web" ? useNativeVariable : (variable) => `var(${variable})`;

export const View = (props: ComponentProps<typeof RNView> & { className?: string }) =>
  useCssElement(RNView, props, { className: "style" });

export const Text = ({
  className,
  ...props
}: ComponentProps<typeof RNText> & { className?: string }) =>
  useCssElement(
    RNText,
    { ...props, className: `font-gotham ${className ?? ""}` },
    { className: "style" },
  );

export const Pressable = (props: ComponentProps<typeof RNPressable> & { className?: string }) =>
  useCssElement<ReactComponent>(RNPressable, props, { className: "style" });

export const Image = (props: ComponentProps<typeof ExpoImage> & { className?: string }) =>
  useCssElement(ExpoImage, props, { className: "style" });

export const ScrollView = (
  props: ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) =>
  useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
