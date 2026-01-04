import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { COLORS } from "@/constants/theme";

type ButtonVariant = "primary" | "outline" | "text";
type ButtonSize = "small" | "medium" | "large";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor = variant === "primary" ? "#fff" : COLORS.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text style={[styles.textBase, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: "center", justifyContent: "center" },
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  medium: { paddingVertical: 16, paddingHorizontal: 24 },
  large: { paddingVertical: 20, paddingHorizontal: 32 },
  primary: { backgroundColor: COLORS.primary },
  primaryPressed: { backgroundColor: COLORS.primaryDark },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  outlinePressed: { backgroundColor: "rgba(139, 92, 246, 0.12)" },
  text: { backgroundColor: "transparent" },
  textPressed: { opacity: 0.7 },
  textBase: { fontSize: 16, fontWeight: "600" },
  primaryText: { color: "#fff" },
  outlineText: { color: COLORS.primary },
  textText: { color: COLORS.primary },
  disabled: { opacity: 0.5 },
});
