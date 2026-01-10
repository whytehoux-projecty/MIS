import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const indicatorColor = variant === "primary" ? "#fff" : theme.primary;

  const getBackgroundColor = (pressed: boolean) => {
    if (variant === "primary") {
      return pressed ? theme.primaryDark : theme.primary;
    }
    if (variant === "outline" && pressed) {
      return "rgba(139, 92, 246, 0.12)"; // Could use a theme color with opacity
    }
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "primary") return "#fff";
    return theme.primary;
  };

  const getBorderColor = () => {
    if (variant === "outline") return theme.primary;
    return "transparent";
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 2 : 0,
        },
        pressed && variant === "text" && styles.textPressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text
          style={[
            styles.textBase,
            { color: getTextColor() },
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, alignItems: "center", justifyContent: "center" },
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  medium: { paddingVertical: 16, paddingHorizontal: 24 },
  large: { paddingVertical: 20, paddingHorizontal: 32 },
  textPressed: { opacity: 0.7 },
  textBase: { fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
