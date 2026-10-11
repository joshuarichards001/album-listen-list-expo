import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useCSSVariable } from "@/tw";

export default function TabsLayout() {
  const backgroundColor = useCSSVariable("--color-background-base");
  const indicatorColor = useCSSVariable("--color-background-highlight");
  const selectedColor = useCSSVariable("--color-text-base");
  const defaultColor = useCSSVariable("--color-text-subdued");
  const fontFamily = useCSSVariable("--font-gotham");

  return (
    <NativeTabs
      backgroundColor={backgroundColor}
      indicatorColor={indicatorColor}
      tintColor={selectedColor}
      iconColor={{ default: defaultColor, selected: selectedColor }}
      labelStyle={{
        default: { fontFamily, color: defaultColor },
        selected: { fontFamily, color: selectedColor },
      }}
    >
      <NativeTabs.Trigger name="(index)">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
