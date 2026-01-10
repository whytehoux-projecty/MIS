export const PALETTE = {
  chaco: {
    DEFAULT: "#1b1b1b",
    light: "#e6e6e6",
    mid: "#bdbdbd",
  },
  violet: {
    500: "#8b5cf6",
    600: "#7c3aed",
    300: "#a78bfa",
  },
  slate: {
    900: "#0f172a",
    800: "#1e293b",
    700: "#334155",
    600: "#475569",
    400: "#94a3b8",
    500: "#64748b",
  },
  status: {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
} as const;

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  error: string;
  warning: string;
  info: string;
};

export const THEME: { dark: ThemeColors; light: ThemeColors } = {
  dark: {
    primary: PALETTE.chaco.light, // High contrast against dark bg
    primaryDark: PALETTE.chaco.mid,
    primaryLight: "#ffffff",
    background: PALETTE.chaco.DEFAULT,
    surface: "#2d2d2d", // Slightly lighter than chaco default
    surfaceLight: PALETTE.chaco.mid,
    text: PALETTE.chaco.light,
    textSecondary: PALETTE.chaco.mid,
    textMuted: "#666666",
    border: "#404040",
    borderLight: "#525252",
    ...PALETTE.status,
  },
  light: {
    primary: PALETTE.chaco.DEFAULT,
    primaryDark: "#000000",
    primaryLight: PALETTE.chaco.mid,
    background: PALETTE.chaco.light,
    surface: "#ffffff",
    surfaceLight: "#f5f5f5",
    text: PALETTE.chaco.DEFAULT,
    textSecondary: "#404040",
    textMuted: "#666666",
    border: PALETTE.chaco.mid,
    borderLight: "#d4d4d4",
    ...PALETTE.status,
  },
};

// Default to Dark Theme to match current app behavior, but using Chaco colors
export const COLORS = THEME.dark;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const FONTS = {
  regular: "System",
  heading: "BebasNeue",
} as const;
