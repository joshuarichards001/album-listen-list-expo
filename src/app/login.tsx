import { useState } from "react";
import { ActivityIndicator } from "react-native";

import { signInWithSpotify } from "@/lib/auth";
import { Pressable, Text, useCSSVariable, View } from "@/tw";

export default function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backgroundColor = useCSSVariable("--color-background-base");

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithSpotify();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 gap-4 p-6">
      <Text className="text-title-lg font-bold text-text-base">Sign in</Text>
      <Text className="mb-4 text-body text-text-subdued">
        Album Listen List uses your Spotify account to find albums.
      </Text>

      <Pressable
        className={`items-center rounded-full bg-spotify-green py-4 ${isSigningIn ? "opacity-60" : ""}`}
        onPress={handleSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <ActivityIndicator color={backgroundColor} />
        ) : (
          <Text className="text-body font-bold text-black">Continue with Spotify</Text>
        )}
      </Pressable>

      {error && <Text className="text-center text-subhead text-danger">{error}</Text>}
    </View>
  );
}
