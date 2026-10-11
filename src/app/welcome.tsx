import { Link } from "expo-router";

import { Pressable, Text, View } from "@/tw";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 justify-between p-6 pt-40 pb-16">
      <View className="gap-3">
        <Text className="text-display font-bold text-text-base">Album Listen List</Text>
        <Text className="text-body text-text-subdued">
          Keep track of the albums you want to listen to.
        </Text>
      </View>

      <Link href="/login" asChild>
        <Pressable className="items-center rounded-full bg-text-base py-4">
          <Text className="text-body font-bold text-background-base">Log in</Text>
        </Pressable>
      </Link>
    </View>
  );
}
