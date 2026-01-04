import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { QRCameraView } from "@/components/scanner/QRCameraView";
import { Button, SafeView } from "@/components/common";
import { APP_CONFIG } from "@/constants/config";
import { COLORS, SPACING } from "@/constants/theme";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";
import { getUserFriendlyError } from "@/utils/errors";
import { extractQrToken } from "@/utils/qr";

export default function ScanScreen() {
  const { authKey } = useAuthStore();
  const { addEntry } = useScanHistoryStore();
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const handleScan = async (data: string) => {
    const qrToken = extractQrToken(data);
    if (!qrToken) {
      Alert.alert("Invalid QR", "That QR code is not recognized.");
      return;
    }
    if (!authKey) {
      Alert.alert("Not linked", "Please link your account first.");
      router.replace("/(onboarding)/link-account");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.scanQRCode(qrToken, authKey);
      if (!result.success) {
        const message = getUserFriendlyError(
          result.error || "Unable to scan QR."
        );
        await addEntry({
          serviceName: null,
          outcome: "failure",
          detail: result.error || "UNKNOWN",
        });
        Alert.alert("Scan failed", message);
        return;
      }

      await addEntry({
        serviceName: result.service_name ?? null,
        outcome: "success",
      });

      router.push({
        pathname: "/(auth)/result",
        params: {
          pin: result.pin,
          expiresIn: String(result.expires_in ?? 300),
          serviceName: result.service_name ?? "",
        },
      });
    } catch (e) {
      const message = getUserFriendlyError((e as Error).message);
      await addEntry({
        serviceName: null,
        outcome: "failure",
        detail: (e as Error).message || "UNKNOWN",
      });
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR</Text>
        <Text style={styles.subtitle}>
          Point your camera at the code on the login screen.
        </Text>
      </View>

      <View style={styles.cameraWrap}>
        {APP_CONFIG.E2E_MODE ? (
          <View style={styles.e2eCard}>
            <Text style={styles.e2eTitle}>E2E Mode</Text>
            <TextInput
              testID="qr-token-input"
              style={styles.e2eInput}
              value={manualToken}
              onChangeText={setManualToken}
              placeholder="Enter token (e.g. hello, expired, used, closed)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <Button
              title="Simulate Scan"
              onPress={() => {
                const token = manualToken.trim() || "hello";
                const data = `https://e2e.local/?qr_token=${encodeURIComponent(token)}`;
                void handleScan(data);
              }}
              disabled={loading}
              testID="simulate-scan"
            />
            <Button
              title="Back"
              variant="text"
              onPress={() => router.back()}
              disabled={loading}
            />
          </View>
        ) : (
          <QRCameraView
            onScan={handleScan}
            onCancel={() => router.back()}
            disabled={loading}
          />
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing…</Text>
          </View>
        )}
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, paddingBottom: SPACING.md, gap: SPACING.xs },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  cameraWrap: { flex: 1 },
  e2eCard: {
    margin: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    gap: SPACING.md,
  },
  e2eTitle: { color: COLORS.text, fontWeight: "800", fontSize: 16 },
  e2eInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  loadingText: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
});
