import { Stack } from "expo-router";

export const unstable_settings = {
  index: { anchor: "index" },
  search: { anchor: "search" },
  profile: { anchor: "profile" },
};

export default function TabStackLayout() {
  return <Stack screenOptions={{ headerShadowVisible: false, headerLargeTitleEnabled: true }} />;
}
