import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, SafeView } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";
import { systemApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";

export default function HomeScreen() {
  const { user, clear } = useAuthStore();
  const { hydrate, entries } = useScanHistoryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [systemOpen, setSystemOpen] = useState<boolean | null>(null);

  const recentEntries = useMemo(() => entries.slice(0, 3), [entries]);

  const loadStatus = async () => {
    try {
      const status = await systemApi.getStatus();
      setSystemOpen(status.status === "open");
      setSystemMessage(status.message);
    } catch (e) {
      setSystemOpen(null);
      setSystemMessage((e as Error).message);
    }
  };

  useEffect(() => {
    hydrate();
    loadStatus();
  }, [hydrate]);

  return (
    <SafeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([loadStatus(), hydrate()]);
              setRefreshing(false);
            }}
            tintColor={COLORS.primary}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Ready to scan</Text>
          <Text style={styles.subtitle}>
            {user?.full_name ? `Signed in as ${user.full_name}` : "Signed in"}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>System status</Text>
          <Text style={styles.statusValue}>
            {systemOpen === null ? "Unknown" : systemOpen ? "Open" : "Closed"}
          </Text>
          {!!systemMessage && (
            <Text style={styles.statusMessage}>{systemMessage}</Text>
          )}
        </View>

        <Button
          title="Scan QR"
          size="large"
          onPress={() => router.push("/(auth)/(tabs)/scan")}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <Button
              title="View all"
              variant="text"
              onPress={() => router.push("/(auth)/(tabs)/history")}
            />
          </View>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No activity yet.</Text>
            </View>
          ) : (
            <View style={styles.activityCard}>
              {recentEntries.map((entry) => (
                <View key={entry.id} style={styles.activityRow}>
                  <Text style={styles.activityService}>
                    {entry.serviceName || "Unknown service"}
                  </Text>
                  <Text
                    style={[
                      styles.activityStatus,
                      entry.outcome === "success"
                        ? styles.activityStatusSuccess
                        : styles.activityStatusFail,
                    ]}>
                    {entry.outcome === "success" ? "Success" : "Failed"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button title="Sign out" variant="outline" onPress={() => clear()} />
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  header: { gap: SPACING.xs },
  title: { fontSize: 32, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  statusTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  statusValue: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  statusMessage: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  section: { gap: SPACING.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  emptyText: { color: COLORS.textSecondary },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  activityRow: {
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityService: { color: COLORS.text, fontWeight: "600" },
  activityStatus: { fontWeight: "700" },
  activityStatusSuccess: { color: COLORS.success },
  activityStatusFail: { color: COLORS.error },
  actions: { marginTop: SPACING.md },
});
