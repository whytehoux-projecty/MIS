import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeView } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";
import { getUserFriendlyError } from "@/utils/errors";

function formatTime(epochMs: number): string {
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

export default function HistoryScreen() {
  const { hydrate, entries } = useScanHistoryStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const items = useMemo(() => entries, [entries]);

  return (
    <SafeView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Recent authentication attempts.</Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No history yet.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {items.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.serviceName}>
                    {entry.serviceName || "Unknown service"}
                  </Text>
                  <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
                  {entry.outcome === "failure" && entry.detail ? (
                    <Text style={styles.detail}>
                      {getUserFriendlyError(entry.detail)}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.badge,
                    entry.outcome === "success"
                      ? styles.badgeSuccess
                      : styles.badgeFailure,
                  ]}
                >
                  {entry.outcome === "success" ? "Success" : "Failed"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  emptyText: { color: COLORS.textSecondary },
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  row: {
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  rowLeft: { flex: 1, gap: SPACING.xs },
  serviceName: { color: COLORS.text, fontWeight: "700" },
  time: { color: COLORS.textMuted, fontSize: 12 },
  detail: { color: COLORS.textSecondary, fontSize: 12 },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    fontWeight: "800",
    fontSize: 12,
  },
  badgeSuccess: { color: COLORS.success, borderColor: COLORS.success, borderWidth: 1 },
  badgeFailure: { color: COLORS.error, borderColor: COLORS.error, borderWidth: 1 },
});

