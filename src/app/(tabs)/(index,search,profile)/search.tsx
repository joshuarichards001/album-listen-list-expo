import { Stack } from "expo-router";

import { ScrollView } from "@/tw";

export default function SearchScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
      <Stack.Title>Search</Stack.Title>
    </ScrollView>
  );
}
