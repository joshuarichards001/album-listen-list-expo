import { Stack } from "expo-router";

import { ScrollView } from "@/tw";

export default function HomeScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
      <Stack.Title>Home</Stack.Title>
    </ScrollView>
  );
}
