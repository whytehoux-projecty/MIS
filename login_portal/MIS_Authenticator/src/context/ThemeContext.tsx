import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { THEME, ThemeColors } from "@/constants/theme";

type ThemeContextType = {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";

  const theme = isDark ? THEME.dark : THEME.light;

  const toggleTheme = () => {
    setMode((prev) => {
      if (prev === "system") {
        return systemScheme === "dark" ? "light" : "dark";
      }
      return prev === "dark" ? "light" : "dark";
    });
  };

  const setThemeMode = (newMode: "light" | "dark" | "system") => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
