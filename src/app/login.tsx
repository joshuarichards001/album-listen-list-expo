import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { signInWithSpotify } from "@/lib/auth";

export default function LoginScreen() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Album Listen List uses your Spotify account to find albums.
      </Text>

      <Pressable
        style={[styles.button, isSigningIn && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Continue with Spotify</Text>
        )}
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSubdued,
    fontSize: 17,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.spotifyGreen,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: "700",
  },
  error: {
    color: colors.error,
    fontSize: 15,
    textAlign: "center",
  },
});
