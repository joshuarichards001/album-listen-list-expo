import { Stack } from "expo-router";

import { useCSSVariable } from "@/tw";

export const unstable_settings = {
  index: { anchor: "index" },
  search: { anchor: "search" },
  profile: { anchor: "profile" },
};

export default function TabStackLayout({ segment }: { segment: string }) {
  const tabScreen = segment.match(/\((.*)\)/)?.[1] ?? "index";
  const sheetBackground = useCSSVariable("--color-background-base");
  const sheetOptions = {
    presentation: "formSheet",
    sheetGrabberVisible: true,
    contentStyle: { backgroundColor: sheetBackground },
  } as const;

  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerLargeTitleEnabled: true }}>
      <Stack.Screen name={tabScreen} />
      <Stack.Screen
        name="lists"
        options={{
          ...sheetOptions,
          title: "Lists",
          sheetAllowedDetents: [0.6, 1],
          headerLargeTitleEnabled: false,
        }}
      />
      <Stack.Screen
        name="new-list"
        options={{ ...sheetOptions, sheetAllowedDetents: "fitToContents", headerShown: false }}
      />
      <Stack.Screen
        name="rename-list/[id]"
        options={{ ...sheetOptions, sheetAllowedDetents: "fitToContents", headerShown: false }}
      />
      <Stack.Screen
        name="album/[id]"
        options={{ ...sheetOptions, sheetAllowedDetents: [0.75, 1], headerShown: false }}
      />
    </Stack>
  );
}
