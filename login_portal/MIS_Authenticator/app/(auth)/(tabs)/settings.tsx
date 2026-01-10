import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { API_CONFIG } from "@/constants/config";
import { SPACING, FONTS } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";
import { useTheme } from "@/context/ThemeContext";
import { useSettingsStore } from "@/stores/settingsStore";
import { BiometricService } from "@/services/biometric.service";

export default function SettingsScreen() {
  const { clear } = useAuthStore();
  const { clear: clearHistory } = useScanHistoryStore();
  const [busy, setBusy] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const { biometricsEnabled, setBiometricsEnabled } = useSettingsStore();

  const handleToggleBiometrics = async () => {
    if (!biometricsEnabled) {
      // Trying to enable
      const hasHardware = await BiometricService.checkHardware();
      if (!hasHardware) {
        Alert.alert("Error", "Biometric hardware is not available on this device.");
        return;
      }

      const isEnrolled = await BiometricService.isEnrolled();
      if (!isEnrolled) {
        Alert.alert("Error", "No biometrics enrolled. Please check your device settings.");
        return;
      }

      // Verify identity before enabling
      const success = await BiometricService.authenticate("Confirm to enable biometrics");
      if (success) {
        setBiometricsEnabled(true);
        Alert.alert("Success", "Biometrics enabled.");
      }
    } else {
      // Disable
      setBiometricsEnabled(false);
    }
  };

  const apiInfo = useMemo(
    () => ({
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT_MS,
      mock: API_CONFIG.USE_MOCK_API,
    }),
    []
  );

  const handleClearHistory = async () => {
    setBusy(true);
    try {
      await clearHistory();
      Alert.alert("Cleared", "History cleared.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await clear();
    } finally {
      setBusy(false);
    }
  };

  const cardStyle = {
    backgroundColor: theme.surface,
    borderColor: theme.border,
  };

  const textStyle = { color: theme.text };
  const subTextStyle = { color: theme.textSecondary };

  return (
    <SafeView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Device settings and app actions.
        </Text>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, textStyle]}>Security</Text>
          <Button
            title={biometricsEnabled ? "Disable Biometrics" : "Enable Biometrics"}
            variant="outline"
            onPress={handleToggleBiometrics}
            disabled={busy}
          />
          <Text style={[styles.rowText, subTextStyle]}>
            {biometricsEnabled ? "Biometrics protection active" : "Biometrics disabled"}
          </Text>
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, textStyle]}>Appearance</Text>
          <Button
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            variant="outline"
            onPress={toggleTheme}
            disabled={busy}
          />
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, textStyle]}>API</Text>
          <Text style={[styles.rowText, subTextStyle]}>
            Base URL: {apiInfo.baseUrl}
          </Text>
          <Text style={[styles.rowText, subTextStyle]}>
            Timeout: {apiInfo.timeout}ms
          </Text>
          <Text style={[styles.rowText, subTextStyle]}>
            Mock mode: {apiInfo.mock ? "Enabled" : "Disabled"}
          </Text>
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, textStyle]}>Data</Text>
          <Button
            title="Clear history"
            variant="outline"
            onPress={handleClearHistory}
            disabled={busy}
          />
        </View>

        <View style={[styles.card, cardStyle]}>
          <Text style={[styles.cardTitle, textStyle]}>Account</Text>
          <Button
            title="Sign out"
            variant="outline"
            onPress={handleSignOut}
            disabled={busy}
          />
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: {
    fontSize: 24,
    fontFamily: FONTS.heading,
  },
  subtitle: { fontSize: 14 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: SPACING.xs },
  rowText: { fontSize: 13 },
});
