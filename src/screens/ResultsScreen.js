
import React, { useEffect, useRef } from "react";
import wasteDisposalGuidance from "../data/wasteDisposalGuidance";
import { saveScan } from "../services/scanHistory";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";

const displayNames = {
  compostables: "Compostables",
  compostables_vegetation: "Vegetation Waste",
  hazardous_batteries: "Batteries",
  "hazardous_e-waste": "Electronic Waste",
  hazardous_medical_gloves: "Medical Gloves",
  hazardous_medical_masks: "Medical Masks",
  hazardous_medical_medicines: "Expired Medicines",
  hazardous_medical_syringe: "Medical Syringes",
  hazardous_paints: "Paint Waste",
  hazardous_pesticides: "Pesticide Waste",
  landfill_ceramic_product: "Ceramic Products",
  landfill_diapers: "Disposable Diapers",
  landfill_platics_bags_wrappers: "Plastic Bags and Wrappers",
  landfill_sanitary_napkin: "Sanitary Napkins",
  landfill_stroform_product: "Styrofoam Products",
  recyclables_beverage_cans: "Beverage Cans",
  recyclables_cardboard: "Cardboard",
  recyclables_construction_scrap: "Construction Scrap",
  recyclables_electrical_cables: "Electrical Cables",
  recyclables_electronic_chips: "Electronic Chips",
  recyclables_glass: "Glass",
  recyclables_laptops: "Laptops",
  recyclables_metal_containers: "Metal Containers",
  recyclables_miscellaneous_trash: "Miscellaneous Recyclables",
  recyclables_news_paper: "Newspapers",
  recyclables_other_metal_objects: "Other Metal Objects",
  recyclables_paper: "Paper",
  recyclables_paper_cups: "Paper Cups",
  recyclables_plastic: "Plastic",
  recyclables_plastic_bags: "Plastic Bags",
  recyclables_plastic_bottles: "Plastic Bottles",
  recyclables_plastic_containers: "Plastic Containers",
  recyclables_plastic_cups: "Plastic Cups",
  recyclables_small_appliances: "Small Appliances",
  recyclables_smartphones: "Smartphones",
  recyclables_spray_cans: "Spray Cans",
  recyclables_tetra_pak: "Tetra Pak Cartons",
};

const getDisplayName = (className) => {
  return (
    displayNames[className] ||
    className
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

export default function ResultScreen({ route, navigation }) {
  const savedRef = useRef(false);

  const { imageUri, prediction } = route.params || {};

  const hasPrediction =
    prediction &&
    typeof prediction.className === "string" &&
    typeof prediction.confidence === "number";

  const guidance = hasPrediction
    ? wasteDisposalGuidance[prediction.className]
    : null;

  // Confidence levels
  const isHighConfidence =
    hasPrediction && prediction.confidence >= 0.8;

  const isMediumConfidence =
    hasPrediction &&
    prediction.confidence >= 0.5 &&
    prediction.confidence < 0.8;

  const isLowConfidence =
    hasPrediction && prediction.confidence < 0.5;

  // Save new scans to history only once
  // Reopened history scans will not be saved again
  useEffect(() => {
    if (
      !hasPrediction ||
      !imageUri ||
      savedRef.current ||
      route.params?.isFromHistory
    ) {
      return;
    }

    savedRef.current = true;

    saveScan(imageUri, prediction)
      .then(() => console.log("Waste scan saved to history!"))
      .catch((error) =>
        console.error("Unable to save scan history:", error)
      );
  }, [
    imageUri,
    prediction,
    hasPrediction,
    route.params?.isFromHistory,
  ]);

  // Return to the main tabs
  const handleBackToScan = () => {
    navigation.replace("Camera");
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back to Scan */}

      <Pressable
        style={styles.backButton}
        onPress={handleBackToScan}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={colors.text}
        />

        <Text style={styles.backText}>
          Back to scan
        </Text>
      </Pressable>

      {/* Header */}

      <Text style={styles.eyebrow}>
        WASTE IDENTIFICATION
      </Text>

      <Text style={styles.title}>
        Classification result
      </Text>

      {/* Selected Image */}

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {/* Classification Result */}

      {hasPrediction ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>
            DETECTED WASTE TYPE
          </Text>

          <Text style={styles.resultName}>
            {isLowConfidence
              ? "Unable to identify confidently"
              : getDisplayName(prediction.className)}
          </Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>
              Model confidence
            </Text>

            <Text style={styles.confidenceValue}>
              {(prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      prediction.confidence * 100
                    )
                  )}%`,
                },
              ]}
            />
          </View>

          {/* High Confidence */}

          {isHighConfidence && (
            <View style={styles.confidenceMessage}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color="#39845A"
              />

              <Text style={styles.highConfidenceText}>
                High confidence prediction
              </Text>
            </View>
          )}

          {/* Medium Confidence */}

          {isMediumConfidence && (
            <View style={styles.confidenceMessage}>
              <Ionicons
                name="alert-circle"
                size={19}
                color="#B7791F"
              />

              <Text style={styles.mediumConfidenceText}>
                Possible match. Please verify the item.
              </Text>
            </View>
          )}

          {/* Low Confidence */}

          {isLowConfidence && (
            <View style={styles.confidenceMessage}>
              <Ionicons
                name="help-circle"
                size={19}
                color="#C45B50"
              />

              <Text style={styles.lowConfidenceText}>
                We couldn't identify this item reliably.
                Try taking another, clearer photo.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.pendingCard}>
          <View style={styles.pendingIcon}>
            <Ionicons
              name="hourglass-outline"
              size={26}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.pendingTitle}>
            Classification unavailable
          </Text>

          <Text style={styles.pendingDescription}>
            Your image is ready. Please try scanning
            again to get a classification result from
            our trained 37-class AI model.
          </Text>
        </View>
      )}

      {/* Disposal Guidance */}

      {hasPrediction && !isLowConfidence && (
        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceTitle}>
            {guidance?.title || "Disposal Guidance"}
          </Text>

          {guidance?.instructions?.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.instructionText}>
                {instruction}
              </Text>
            </View>
          ))}

          <View style={styles.destinationBox}>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.primaryDark}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.destinationTitle}>
                Recommended destination
              </Text>

              <Text style={styles.destinationText}>
                {guidance?.destination ||
                  "Check with your local waste collection service."}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Scan Another Item */}

      <Pressable
        style={styles.button}
        onPress={handleBackToScan}
      >
        <Ionicons
          name="scan-outline"
          size={19}
          color="#FFFFFF"
        />

        <Text style={styles.buttonText}>
          Scan another item
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 22,
    paddingTop: 35,
    paddingBottom: 40,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 30,
  },

  backText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 22,
  },

  image: {
    width: "100%",
    height: 245,
    borderRadius: 18,
    marginBottom: 20,
    backgroundColor: colors.surfaceSecondary,
  },

  resultCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  resultLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  resultName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primaryDark,
    marginTop: 10,
    textTransform: "capitalize",
  },

  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },

  confidenceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  confidenceValue: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },

  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  confidenceMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 16,
  },

  highConfidenceText: {
    color: "#39845A",
    fontSize: 13,
    fontWeight: "600",
  },

  mediumConfidenceText: {
    color: "#B7791F",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  lowConfidenceText: {
    color: "#C45B50",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  pendingCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  pendingIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  pendingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginTop: 17,
  },

  pendingDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
  },

  guidanceCard: {
    marginTop: 18,
    padding: 20,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 17,
  },

  guidanceTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  guidanceDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },

  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15,
    gap: 11,
  },

  instructionNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  instructionNumberText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },

  instructionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },

  destinationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginTop: 22,
  },

  destinationTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  destinationText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },

  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: 13,
    padding: 17,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
