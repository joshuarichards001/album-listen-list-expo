import { signOut } from "@/lib/auth";
import { useRootStore } from "@/stores/root-store";
import { Image, Pressable, Text, View } from "@/tw";

export default function HomeScreen() {
  const displayName = useRootStore((state) => state.displayName);
  const spotifyId = useRootStore((state) => state.spotifyId);
  const profileImage = useRootStore((state) => state.profileImage);

  return (
    <View className="flex-1 items-center justify-center gap-2 p-6">
      {profileImage ? <Image source={profileImage} className="mb-2 size-24 rounded-full" /> : null}
      <Text className="text-title font-bold text-foreground">{displayName || spotifyId}</Text>
      <Text className="text-body text-subdued">@{spotifyId}</Text>

      <Pressable
        className="mt-8 rounded-full border border-subdued px-8 py-3"
        onPress={() => signOut()}
      >
        <Text className="text-subhead font-semibold text-foreground">Sign out</Text>
      </Pressable>
    </View>
  );
}
