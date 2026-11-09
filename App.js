
import React, { useEffect, useRef, useState } from "react";
import * as Network from "expo-network";

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import HomeScreen from "./src/screens/HomeScreen";
import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ResultScreen from "./src/screens/ResultsScreen";
import CameraScreen from "./src/screens/CameraScreen";

import WelcomeScreen from "./src/screens/auth/WelcomeScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";

import { supabase } from "./src/services/supabase";
import { syncPendingScans } from "./src/services/scanHistory";
import colors from "./src/theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navigationRef = createNavigationContainerRef();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,

        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 5,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Scan: focused ? "scan" : "scan-outline",
            History: focused ? "time" : "time-outline",
            Profile: focused ? "person" : "person-outline",
          };

          return (
            <Ionicons
              name={icons[route.name]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const recoveryStarted = useRef(false);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let mounted = true;

    const runPendingSync = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();

        if (
          networkState.isConnected &&
          networkState.isInternetReachable !== false
        ) {
          console.log("Internet available. Checking pending scans...");
          await syncPendingScans();
        }
      } catch (error) {
        console.warn("Automatic sync check failed:", error);
      }
    };

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setInitialRoute(session ? "MainTabs" : "Welcome");
        }

        if (session) {
          await runPendingSync();
        }
      } catch (error) {
        console.error("Session check failed:", error);

        if (mounted) {
          setInitialRoute("Welcome");
        }
      }
    };

    checkSession();

    // Listen for internet connectivity changes.
    const networkSubscription =
      Network.addNetworkStateListener((state) => {
        console.log("NETWORK STATE CHANGED:", state);

        if (
          state.isConnected &&
          state.isInternetReachable !== false
        ) {
          console.log("Internet reconnected. Starting pending sync...");

          void syncPendingScans();
        }
      });

    // Listen for authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && navigationRef.isReady()) {
        navigationRef.resetRoot({
          index: 0,
          routes: [{ name: "Welcome" }],
        });
      }

      if (event === "SIGNED_IN") {
        setTimeout(() => {
          void runPendingSync();
        }, 0);
      }
    });

    return () => {
      mounted = false;
      networkSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigationReady = async () => {
    if (recoveryStarted.current) return;

    recoveryStarted.current = true;

    try {
      const pendingResult =
        await ImagePicker.getPendingResultAsync();

      if (
        pendingResult &&
        "canceled" in pendingResult &&
        !pendingResult.canceled &&
        pendingResult.assets?.length > 0
      ) {
        const asset = pendingResult.assets[0];

        console.log("Recovered camera image:", asset.uri);

        navigationRef.navigate("MainTabs", {
          screen: "Scan",
          params: {
            pendingImageAsset: asset,
          },
        });
      } else if (pendingResult && "code" in pendingResult) {
        console.error(
          "Image picker recovery error:",
          pendingResult.message
        );
      }
    } catch (error) {
      console.error("Pending image recovery failed:", error);
    }
  };

  if (!initialRoute) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primaryDark}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={handleNavigationReady}
      >
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Result" component={ResultScreen} />

          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
