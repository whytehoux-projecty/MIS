import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, SafeView } from "@/components/common";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { COLORS, SPACING } from "@/constants/theme";
import { getUserFriendlyError } from "@/utils/errors";
import { normalizeAuthKey } from "@/utils/validation";

export default function LinkAccountScreen() {
  const [authKeyInput, setAuthKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuthKey, setUser, setOnboardingComplete } = useAuthStore();

  const normalizedKey = useMemo(
    () => normalizeAuthKey(authKeyInput),
    [authKeyInput]
  );

  const handleContinue = async () => {
    if (!normalizedKey) {
      Alert.alert("Missing Key", "Please enter your membership key.");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.validateKey(normalizedKey);
      if (!result.valid || !result.user) {
        Alert.alert(
          "Invalid Key",
          getUserFriendlyError(
            result.error || "Please check your key and try again."
          )
        );
        return;
      }

      await setAuthKey(normalizedKey);
      await setOnboardingComplete(true);
      setUser(result.user);
      router.replace("/(auth)/(tabs)/home");
    } catch (err) {
      Alert.alert(
        "Error",
        getUserFriendlyError(
          (err as Error).message || "Failed to validate key."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeView style={styles.container}>
      <Text style={styles.title}>Enter your Membership Key</Text>
      <Text style={styles.subtitle}>
        You can find this in your profile on the admin portal.
      </Text>

      <TextInput
        testID="auth-key-input"
        style={styles.input}
        value={authKeyInput}
        onChangeText={setAuthKeyInput}
        placeholder="xxxx-xxxx-xxxx-xxxx"
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.hintRow}>
        <Text style={styles.hint}>Saved as:</Text>
        <Text style={styles.hintValue}>{normalizedKey || "—"}</Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="large"
          loading={loading}
          disabled={!normalizedKey}
          testID="auth-key-continue"
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
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  hint: { color: COLORS.textMuted, fontSize: 12 },
  hintValue: { color: COLORS.textSecondary, fontSize: 12 },
  footer: { marginTop: SPACING.xl },
});
