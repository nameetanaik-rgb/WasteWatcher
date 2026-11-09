
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import ImageCropPicker from "react-native-image-crop-picker";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";

export default function CameraScreen({ navigation }) {
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error("The camera did not return an image.");
      }

      console.log("Captured photo URI:", photo.uri);

      const croppedImage = await ImageCropPicker.openCropper({
        path: photo.uri,
        width: 1600,
        height: 1600,
        freeStyleCropEnabled: true,
        compressImageQuality: 0.9,
        cropperToolbarTitle: "Adjust your photo",
        cropperToolbarColor: "#254D3B",
        cropperToolbarWidgetColor: "#FFFFFF",
        cropperActiveWidgetColor: "#8EAD91",
        showCropGuidelines: true,
        showCropFrame: true,
        mediaType: "photo",
      });

      if (!croppedImage?.path) {
        throw new Error("The cropped image could not be saved.");
      }

      navigation.navigate("MainTabs", {
        screen: "Scan",
        params: {
          capturedImage: {
            uri: croppedImage.path,
            width: croppedImage.width,
            height: croppedImage.height,
            fileName: "WasteWatcher_Capture.jpg",
            fileSize: croppedImage.size,
          },
        },
      });
    } catch (error) {
      if (error?.code === "E_PICKER_CANCELLED") {
        return;
      }

      console.error("Camera or crop error:", error);

      Alert.alert(
        "Photo processing failed",
        error?.message || "Unable to process this photo. Please try again."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.permissionText}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={55} color={colors.primary} />

        <Text style={styles.permissionTitle}>
          Camera permission required
        </Text>

        <Text style={styles.permissionText}>
          Allow camera access to capture waste images.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Allow camera access
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <View style={styles.overlay} pointerEvents="box-none">

        {/* TOP SECTION */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isCapturing}
          >
            <Ionicons name="close" size={25} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.topTitle}>Capture waste</Text>

          <View style={styles.placeholder} />
        </View>

        {/* MIDDLE SECTION */}
        <View style={styles.guideContainer} pointerEvents="none">
          <View style={styles.tipBox}>
            <Ionicons name="scan-outline" size={21} color="#FFFFFF" />

            <Text style={styles.guideText}>
              Capture the waste item. You can adjust the crop next.
            </Text>
          </View>
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            Keep the object clear and well lit
          </Text>

          <Pressable
            style={[
              styles.captureButton,
              isCapturing && styles.captureDisabled,
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color={colors.primaryDark} />
            ) : (
              <View style={styles.captureInner} />
            )}
          </Pressable>

          <Text style={styles.captureLabel}>
            {isCapturing ? "Processing photo..." : "Take photo"}
          </Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
overlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
},

  topBar: {
    width: "100%",
    height: 110,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  topTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  placeholder: {
    width: 42,
    height: 42,
  },

  guideContainer: {
  position: "absolute",
  top: "38%",
  left: 35,
  right: 35,
  alignItems: "center",
},

  tipBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },

  guideText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

 bottomBar: {
  position: "absolute",
  bottom: 30,
  left: 0,
  right: 0,
  alignItems: "center",
  justifyContent: "center",
},

  bottomText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 16,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
  },

  captureDisabled: {
    opacity: 0.6,
  },

  captureLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 20,
  },

  permissionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },

  permissionButton: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 18,
    padding: 10,
  },

  cancelText: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
});
