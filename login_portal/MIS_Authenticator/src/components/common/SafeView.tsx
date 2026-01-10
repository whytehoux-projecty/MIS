import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeViewProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function SafeView({ children, style }: SafeViewProps) {
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
}

