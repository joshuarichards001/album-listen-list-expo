import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Album Listen List</Text>
        <Text style={styles.subtitle}>Keep track of the albums you want to listen to.</Text>
      </View>

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 160,
    paddingBottom: 64,
  },
  hero: {
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSubdued,
    fontSize: 17,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: "700",
  },
});
