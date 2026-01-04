import { router } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";

export default function PermissionsScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission?.granted) {
      router.replace("/(onboarding)/link-account");
    }
  }, [permission?.granted]);

  const handleContinue = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Camera access is required to scan QR codes."
      );
    }
  };

  return (
    <SafeView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enable camera access</Text>
        <Text style={styles.subtitle}>
          Central Auth uses your camera to scan QR codes during secure login.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we use it for</Text>
          <Text style={styles.cardText}>- Scan login QR codes</Text>
          <Text style={styles.cardText}>- Verify account linking codes</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} size="large" />
        <Button
          title="Not now"
          variant="text"
          onPress={() => router.replace("/(onboarding)/link-account")}
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
  content: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: { gap: SPACING.md },
});
