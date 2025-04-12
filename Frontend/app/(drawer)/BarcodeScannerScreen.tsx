import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Alert, Platform } from "react-native";
import { Camera } from "expo-camera";

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          📷 Barcode Scanner is only available on mobile devices (iOS or Android).
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleBarCodeScanned = ({ data }: any) => {
    setScanned(true);
    Alert.alert("Scanned successfully!", `Data: ${data}`);
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={(ref) => (cameraRef.current = ref)}
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        ratio="16:9"
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1, width: "100%" },
  message: {
    textAlign: "center",
    fontSize: 16,
    padding: 20,
    color: "#555",
  },
});
