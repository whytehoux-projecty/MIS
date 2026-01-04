import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function AuthLayout() {
  const { authKey, onboardingComplete } = useAuthStore();

  if (!authKey || !onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
