import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";

type QRCameraViewProps = {
  onScan: (data: string) => void;
  onCancel: () => void;
  disabled?: boolean;
};

export function QRCameraView({
  onScan,
  onCancel,
  disabled,
}: QRCameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleScan = async ({ data }: { data: string }) => {
    if (disabled) return;
    if (scanned) return;
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScan(data);
    setTimeout(() => setScanned(false), 1000);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to scan QR codes
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <Button title="Cancel" variant="text" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        onBarcodeScanned={
          disabled ? undefined : scanned ? undefined : handleScan
        }
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instructionText}>Point camera at QR code</Text>
      </View>

      <View style={styles.controls}>
        <Button
          title={flashOn ? "Flash On" : "Flash Off"}
          variant="outline"
          onPress={() => setFlashOn((v) => !v)}
          disabled={disabled}
        />
        <Button
          title="Cancel"
          variant="text"
          onPress={onCancel}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  permissionText: { fontSize: 16, color: COLORS.text, textAlign: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  instructionText: {
    marginTop: SPACING.xl,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 10,
  },
  controls: {
    position: "absolute",
    bottom: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    gap: SPACING.md,
  },
});
