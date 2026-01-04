import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { COLORS } from "@/constants/theme";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";

export default function Index() {
  const { isHydrated, hydrate, authKey, onboardingComplete } = useAuthStore();
  const hydrateHistory = useScanHistoryStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    hydrateHistory();
  }, [hydrate, hydrateHistory]);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
        }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (authKey && onboardingComplete) {
    return <Redirect href="/(auth)/(tabs)/home" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
