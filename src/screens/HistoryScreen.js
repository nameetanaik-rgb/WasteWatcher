
import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";
import {
  getScanHistory,
  deleteScan,
  clearScanHistory,
} from "../services/scanHistory";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const scans = await getScanHistory();
      setHistory(scans);
    } catch (error) {
      console.error("Unable to load scan history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleDelete = (scanId) => {
    Alert.alert(
      "Delete scan",
      "Are you sure you want to delete this scan?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedHistory = await deleteScan(scanId);
              setHistory(updatedHistory);
            } catch (error) {
              console.error("Unable to delete scan:", error);
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear history",
      "This will permanently delete all your saved scans.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: async () => {
            try {
              await clearScanHistory();
              setHistory([]);
            } catch (error) {
              console.error("Unable to clear history:", error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatName = (name) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your scans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>YOUR ACTIVITY</Text>

      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Scan history</Text>
          <Text style={styles.description}>
            Keep track of the waste you identify.
          </Text>
        </View>

        {history.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{history.length}</Text>
          </View>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="time-outline"
              size={38}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>No scans yet</Text>

          <Text style={styles.emptyDescription}>
            Your previous waste classifications will appear here once you
            start scanning.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent scans</Text>

            <Pressable onPress={handleClearHistory}>
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {history.map((scan) => (
              <Pressable
                key={scan.id}
                style={styles.scanCard}
                onPress={() =>
                  navigation.navigate("Result", {
                    imageUri: scan.imageUri,
                    prediction: {
                      className: scan.className,
                      confidence: scan.confidence,
                    },
                    isFromHistory: true,
                  })
                }
              >
                <Image
                  source={{ uri: scan.imageUri }}
                  style={styles.scanImage}
                />

                <View style={styles.scanInfo}>
                  <Text style={styles.scanName} numberOfLines={2}>
                    {formatName(scan.className)}
                  </Text>

                  <Text style={styles.scanConfidence}>
                    {(scan.confidence * 100).toFixed(1)}% confidence
                  </Text>

                  <Text style={styles.scanDate}>
                    {formatDate(scan.date)}
                  </Text>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(scan.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 35,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.primary,
  },

  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },

  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },

  countBadge: {
    backgroundColor: colors.primaryLight,
    minWidth: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  countText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  listContent: {
    paddingBottom: 30,
  },

  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E8EEE9",
  },

  scanImage: {
    width: 82,
    height: 82,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  scanInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "center",
  },

  scanName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  scanConfidence: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 5,
  },

  scanDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },

  deleteButton: {
    padding: 8,
    marginLeft: 3,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 65,
  },

  iconContainer: {
    height: 85,
    width: 85,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 22,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 9,
    maxWidth: 270,
  },
});
