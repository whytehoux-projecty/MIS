import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { View, Text, Button, StyleSheet } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";
import { BiometricService } from "@/services/biometric.service";
import { COLORS } from "@/constants/theme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BebasNeue: require("../assets/fonts/BebasNeue-Regular.ttf"),
  });

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      checkAuth();
    }
  }, [loaded, error]);

  const checkAuth = async () => {
    try {
      // Ensure hydration
      if (!useSettingsStore.persist.hasHydrated()) {
        await useSettingsStore.persist.rehydrate();
      }

      const enabled = useSettingsStore.getState().biometricsEnabled;

      if (enabled) {
        setIsLocked(true);
        const success = await BiometricService.authenticate();
        if (success) {
          setIsLocked(false);
        }
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      console.warn("Auth check failed", e);
      setIsLocked(false); // Fallback to open? Or locked? Open for now to avoid bricking.
    } finally {
      setIsAuthChecked(true);
      SplashScreen.hideAsync();
    }
  };

  if ((!loaded && !error) || !isAuthChecked) {
    return null;
  }

  if (isLocked) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={styles.lockContainer}>
            <Text style={styles.lockTitle}>Locked</Text>
            <Text style={styles.lockSub}>Biometric authentication required</Text>
            <Button title="Unlock" onPress={checkAuth} />
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20
  },
  lockTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text
  },
  lockSub: {
    fontSize: 16,
    color: COLORS.textSecondary
  }
});
