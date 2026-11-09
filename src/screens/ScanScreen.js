
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import colors from "../theme/colors";
import { classifyWaste } from "../services/wasteClassifier";

export default function ScanScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  // Save selected or captured image details
  const handleImage = (asset) => {
    if (!asset?.uri) return;

    setImage(asset.uri);

    setImageDetails({
      name: asset.fileName || "Selected image",
      width: asset.width,
      height: asset.height,
      size: asset.fileSize,
    });
  };

  // Receive image captured by the in-app camera
  useEffect(() => {
    const capturedImage = route?.params?.capturedImage;

    if (!capturedImage?.uri) return;

    handleImage(capturedImage);

    navigation.setParams({
      capturedImage: null,
    });
  }, [route?.params?.capturedImage]);

  // Open the new in-app camera
  const openCamera = () => {
    navigation.navigate("Camera");
  };

  // Open device gallery
  const openGallery = async () => {
    try {
      setLoading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery permission required",
          "Please allow photo library access to select waste images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        handleImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Gallery error:", error);

      Alert.alert(
        "Gallery error",
        "Unable to select an image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setImageDetails(null);
  };

  // Classify selected image using the trained AI model
  const handleClassification = async () => {
    if (!image || isClassifying) return;

    try {
      setIsClassifying(true);

      console.log("Starting AI waste classification...");

      const prediction = await classifyWaste(image);

      console.log("AI Prediction:", prediction);

      navigation.navigate("Result", {
        imageUri: image,
        prediction: prediction,
      });
    } catch (error) {
      console.error("AI Classification Error:", error);

      Alert.alert(
        "Classification failed",
        error.message ||
          "Unable to classify this image. Please try again."
      );
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <Text style={styles.eyebrow}>
        AI WASTE IDENTIFICATION
      </Text>

      <Text style={styles.title}>
        Scan your waste.
      </Text>

      <Text style={styles.description}>
        Capture an image or choose an existing photo
        to identify its waste category.
      </Text>

      {/* Image Preview */}

      <View style={styles.previewContainer}>
        {image ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />

            <Pressable
              style={styles.removeButton}
              onPress={removeImage}
              disabled={isClassifying}
            >
              <Ionicons
                name="close"
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyPreview}>
            <View style={styles.cameraIcon}>
              <Ionicons
                name="camera-outline"
                size={36}
                color={colors.primary}
              />
            </View>

            <Text style={styles.previewTitle}>
              No image selected
            </Text>

            <Text style={styles.previewDescription}>
              Your captured or selected image
              will appear here.
            </Text>
          </View>
        )}
      </View>

      {/* Image Information */}

      {imageDetails && (
        <View style={styles.imageInfo}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="image-outline"
              size={20}
              color={colors.primaryDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fileName}>
              {imageDetails.name}
            </Text>

            <Text style={styles.fileDetails}>
              {imageDetails.width} × {imageDetails.height}
              {imageDetails.size
                ? ` · ${(imageDetails.size / 1048576).toFixed(2)} MB`
                : ""}
            </Text>
          </View>
        </View>
      )}

      {/* AI Identification Button */}

      {image && (
        <Pressable
          style={[
            styles.primaryButton,
            isClassifying && styles.disabledButton,
          ]}
          onPress={handleClassification}
          disabled={isClassifying || loading}
        >
          {isClassifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons
              name="scan-outline"
              size={21}
              color="#FFFFFF"
            />
          )}

          <Text style={styles.primaryButtonText}>
            {isClassifying
              ? "Analyzing image..."
              : "Identify waste"}
          </Text>
        </Pressable>
      )}

      {/* In-app Camera Button */}

      <Pressable
        style={[
          styles.primaryButton,
          (loading || isClassifying) && styles.disabledButton,
        ]}
        onPress={openCamera}
        disabled={loading || isClassifying}
      >
        <Ionicons
          name="camera-outline"
          size={21}
          color="#FFFFFF"
        />

        <Text style={styles.primaryButtonText}>
          Take a photo
        </Text>
      </Pressable>

      {/* Gallery Button */}

      <Pressable
        style={[
          styles.secondaryButton,
          (loading || isClassifying) && styles.disabledButton,
        ]}
        onPress={openGallery}
        disabled={loading || isClassifying}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryDark} />
        ) : (
          <Ionicons
            name="images-outline"
            size={21}
            color={colors.primaryDark}
          />
        )}

        <Text style={styles.secondaryButtonText}>
          {loading ? "Please wait..." : "Choose from gallery"}
        </Text>
      </Pressable>

      {/* AI Status */}

      <View style={styles.noteCard}>
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={colors.primary}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.noteTitle}>
            AI classification
          </Text>

          <Text style={styles.noteDescription}>
            Your image is processed directly on your
            device using our trained 37-class AI
            waste classification model.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 35,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.primary,
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 25,
  },

  previewContainer: {
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  cameraIcon: {
    width: 75,
    height: 75,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  previewDescription: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 7,
  },

  imageWrapper: {
    flex: 1,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(41,55,44,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  imageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    padding: 13,
    borderRadius: 13,
    marginTop: 14,
    marginBottom: 5,
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },

  fileName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  fileDetails: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },

  primaryButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 13,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.65,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  noteCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 15,
    marginTop: 25,
  },

  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  noteDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 5,
  },
});
