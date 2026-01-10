import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Button, SafeView } from "@/components/common";
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme";
import { formatPin } from "@/utils/formatting";

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    pin?: string;
    expiresIn?: string;
    serviceName?: string;
  }>();
  const pin = params.pin ?? "";
  const serviceName = params.serviceName ?? "";
  const expiresIn = Number(params.expiresIn ?? "300");

  const [remaining, setRemaining] = useState(() =>
    Number.isFinite(expiresIn) ? expiresIn : 300
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const expired = remaining <= 0;
  const title = useMemo(
    () => (serviceName ? `PIN for ${serviceName}` : "Your PIN"),
    [serviceName]
  );

  const handleCopy = async () => {
    if (expired) return;
    if (!pin) return;
    await Clipboard.setStringAsync(pin);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied", "PIN copied to clipboard.");
  };

  return (
    <SafeView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {expired ? "Expired" : `Expires in ${remaining}s`}
        </Text>

        <View style={styles.pinCard}>
          <Text style={styles.pin}>{formatPin(pin)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Copy"
            onPress={handleCopy}
            disabled={expired || !pin}
          />
          <Button
            title="Back to Home"
            variant="outline"
            onPress={() => router.replace("/(auth)/(tabs)/home")}
          />
        </View>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: "center",
    gap: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center" },
  pinCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  pin: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 4,
  },
  actions: { gap: SPACING.md },
});
