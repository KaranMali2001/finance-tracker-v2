import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { saveApiKey } from "../utils/secureStore";

interface Props {
  onSuccess: () => void;
}

export function QrScanScreen({ onSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (!scanning) return;
    setScanning(false);

    try {
      const url = new URL(data);
      if (url.protocol !== "financeapp:") throw new Error("Invalid QR code");
      const apiKey = url.searchParams.get("api_key");
      if (!apiKey) throw new Error("No API key in QR code");
      await saveApiKey(apiKey);
      onSuccess();
    } catch {
      setError("Invalid QR code. Please scan the QR from the Finance Tracker web app.");
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#d9b364" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>
          Camera access is needed to scan the QR code from your web app.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Scan Failed</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => { setError(null); setScanning(true); }}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Scan QR Code</Text>
        <Text style={styles.overlaySubtitle}>
          Open Finance Tracker on web → Profile → Generate QR
        </Text>
        <View style={styles.frame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  overlayTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  overlaySubtitle: {
    color: "#e0dbd2",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "#d9b364",
    borderRadius: 12,
  },
  center: {
    flex: 1,
    backgroundColor: "#faf9f7",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  title: { color: "#433d38", fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#78716c", fontSize: 14, textAlign: "center", lineHeight: 20 },
  button: {
    backgroundColor: "#d9b364",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
