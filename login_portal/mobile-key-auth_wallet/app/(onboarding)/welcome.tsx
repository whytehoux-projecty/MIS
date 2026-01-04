import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";

export default function WelcomeScreen() {
  return (
    <SafeView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🔐</Text>
        </View>
        <Text style={styles.title}>Central Auth</Text>
        <Text style={styles.subtitle}>
          Secure authentication for all your services
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => router.push("/(onboarding)/permissions")}
          size="large"
        />
        <Button
          title="Link Account"
          variant="text"
          onPress={() => router.push("/(onboarding)/link-account")}
        />
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  logoText: { fontSize: 56 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: "center" },
  footer: { gap: SPACING.md },
});
