
import React from "react";

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import wasteCategories from "../data/wasteCategories";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>WASTEWATCHER</Text>
          <Text style={styles.subtitle}>
            Sustainable living starts here.
          </Text>
        </View>

        <Pressable style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={21}
            color={colors.primaryDark}
          />
        </Pressable>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.eyebrow}>
          SMART WASTE MANAGEMENT
        </Text>

        <Text style={styles.title}>
          Your waste,{"\n"}understood.
        </Text>

        <Text style={styles.description}>
          Identify everyday waste and discover
          the right way to dispose of it.
        </Text>
      </View>

      <View style={styles.scanCard}>
        <View style={styles.scanIcon}>
          <Ionicons
            name="scan-outline"
            size={29}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.scanTitle}>
          Identify your waste
        </Text>

        <Text style={styles.scanDescription}>
          Use AI-powered image recognition
          to classify your waste.
        </Text>

        <Pressable
          style={styles.scanButton}
          onPress={() => navigation.navigate("Scan")}
        >
          <Text style={styles.scanButtonText}>
            Start scanning
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color={colors.primaryDark}
          />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Explore categories
        </Text>

        <Text style={styles.categoryCount}>
          04 CATEGORIES
        </Text>
      </View>

      <View style={styles.grid}>
        {wasteCategories.map((item) => (
          <View key={item.id} style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <Ionicons
                name={item.icon}
                size={24}
                color={colors.primaryDark}
              />
            </View>

            <Text style={styles.categoryName}>
              {item.name}
            </Text>

            <Text style={styles.categoryDescription}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={colors.primary}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>
            Make informed choices
          </Text>

          <Text style={styles.infoDescription}>
            Proper waste segregation helps reduce
            environmental pollution.
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        SMALL ACTIONS. LASTING IMPACT.
      </Text>
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
    paddingTop: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 38,
  },

  brand: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.primaryDark,
  },

  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },

  avatar: {
    height: 43,
    width: 43,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  welcome: {
    marginBottom: 26,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 12,
  },

  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700",
    color: colors.text,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 12,
  },

  scanCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 22,
    padding: 23,
    marginBottom: 34,
  },

  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#60785F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  scanTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  scanDescription: {
    color: "#DCE5D8",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    marginBottom: 22,
  },

  scanButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  scanButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },

  categoryCount: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  categoryCard: {
    width: "48%",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 139,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  categoryDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },

  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surfaceSecondary,
    padding: 17,
    borderRadius: 16,
    marginTop: 28,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  infoDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },

  footer: {
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 30,
  },
});
