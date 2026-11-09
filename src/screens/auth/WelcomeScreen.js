
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../../theme/colors";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="leaf-outline"
              size={43}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.appName}>WasteWatcher</Text>
          <Text style={styles.version}>SMART WASTE MANAGEMENT</Text>
        </View>

        <View style={styles.intro}>
          <Text style={styles.heading}>
            A cleaner world{"\n"}starts with you.
          </Text>

          <Text style={styles.description}>
            Identify waste, discover the right way
            to dispose of it, and make every
            action count.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.primaryButtonText}>
              Create account
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={colors.surface}
            />
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.secondaryButtonText}>
              Log in
            </Text>
          </Pressable>

          <Pressable
            style={styles.guestButton}
            onPress={() => navigation.replace("MainTabs")}
          >
            <Text style={styles.guestButtonText}>
              Continue as guest
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.primaryDark}
            />
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>
        SMALL ACTIONS. BIG IMPACT.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 65,
  },

  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  appName: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.primaryDark,
    letterSpacing: -0.7,
  },

  version: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.2,
    color: colors.textSecondary,
    marginTop: 8,
  },

  intro: {
    marginBottom: 42,
  },

  heading: {
    fontSize: 34,
    lineHeight: 43,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 17,
    paddingHorizontal: 8,
  },

  actions: {
    gap: 13,
  },

  primaryButton: {
    height: 56,
    backgroundColor: colors.primaryDark,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 55,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "700",
  },

  guestButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  guestButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 25,
  },
});
