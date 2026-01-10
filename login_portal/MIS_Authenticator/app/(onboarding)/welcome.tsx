import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { SPACING, FONTS } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export default function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <Text style={styles.logoText}>🔐</Text>
        </View>
        <Text
          style={[
            styles.title,
            { color: theme.text, fontFamily: FONTS.heading },
          ]}>
          MIS Authenticator
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  logoText: { fontSize: 56 },
  title: {
    fontSize: 48, // Increased size for Bebas Neue
    marginBottom: SPACING.sm,
  },
  subtitle: { fontSize: 16, textAlign: "center" },
  footer: { gap: SPACING.md },
});
