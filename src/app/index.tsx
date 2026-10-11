import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { signOut } from "@/lib/auth";
import { useRootStore } from "@/stores/root-store";

export default function HomeScreen() {
  const displayName = useRootStore((state) => state.displayName);
  const spotifyId = useRootStore((state) => state.spotifyId);
  const profileImage = useRootStore((state) => state.profileImage);

  return (
    <View style={styles.container}>
      {profileImage ? (
        <Image source={profileImage} style={styles.avatar} />
      ) : null}
      <Text style={styles.name}>{displayName || spotifyId}</Text>
      <Text style={styles.username}>@{spotifyId}</Text>

      <Pressable style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  username: {
    color: colors.textSubdued,
    fontSize: 17,
  },
  button: {
    marginTop: 32,
    borderColor: colors.textSubdued,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
