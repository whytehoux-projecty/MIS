import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";

export default function Index() {
  const { isHydrated, hydrate, authKey, onboardingComplete } = useAuthStore();
  const hydrateHistory = useScanHistoryStore((s) => s.hydrate);
  const { theme } = useTheme();

  useEffect(() => {
    hydrate();
    hydrateHistory();
  }, [hydrate, hydrateHistory]);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
        }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (authKey && onboardingComplete) {
    return <Redirect href="/(auth)/(tabs)/home" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
