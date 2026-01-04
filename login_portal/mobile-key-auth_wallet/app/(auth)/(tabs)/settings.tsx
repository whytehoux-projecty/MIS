import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { API_CONFIG } from "@/constants/config";
import { COLORS, SPACING } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";

export default function SettingsScreen() {
  const { clear } = useAuthStore();
  const { clear: clearHistory } = useScanHistoryStore();
  const [busy, setBusy] = useState(false);

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

  return (
    <SafeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Device settings and app actions.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>API</Text>
          <Text style={styles.rowText}>Base URL: {apiInfo.baseUrl}</Text>
          <Text style={styles.rowText}>Timeout: {apiInfo.timeout}ms</Text>
          <Text style={styles.rowText}>
            Mock mode: {apiInfo.mock ? "Enabled" : "Disabled"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data</Text>
          <Button
            title="Clear history"
            variant="outline"
            onPress={handleClearHistory}
            disabled={busy}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  rowText: { color: COLORS.textSecondary, fontSize: 13 },
});

