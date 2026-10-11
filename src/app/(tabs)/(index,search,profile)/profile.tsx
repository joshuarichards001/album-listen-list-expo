import { Stack } from "expo-router";

import { signOut } from "@/lib/auth";
import { useRootStore } from "@/stores/root-store";
import { Image, Pressable, ScrollView, Text } from "@/tw";

export default function ProfileScreen() {
  const displayName = useRootStore((state) => state.displayName);
  const spotifyId = useRootStore((state) => state.spotifyId);
  const profileImage = useRootStore((state) => state.profileImage);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1"
      contentContainerClassName="items-center gap-2 p-6"
    >
      <Stack.Title>Profile</Stack.Title>
      {profileImage ? <Image source={profileImage} className="mb-2 size-24 rounded-full" /> : null}
      <Text className="text-title font-bold text-text-base">{displayName || spotifyId}</Text>
      <Text className="text-body text-text-subdued">@{spotifyId}</Text>

      <Pressable
        className="mt-8 rounded-full border border-text-subdued px-8 py-3"
        onPress={() => signOut()}
      >
        <Text className="text-subhead font-semibold text-text-base">Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
