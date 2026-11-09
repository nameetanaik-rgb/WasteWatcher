
import React, { useEffect, useState } from "react";


import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";

import {
  getCurrentUser,
  updateProfile,
  signOut,
} from "../services/authService";

import {
  getReminderSettings,
  scheduleWasteReminders,
  disableWasteReminders,
} from "../services/notificationService";

const WEEKDAYS = [
  { label: "Sun", value: 1 },
  { label: "Mon", value: 2 },
  { label: "Tue", value: 3 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 7 },
];

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState([
    1, 2, 3, 4, 5, 6, 7,
  ]);
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);

  // Load profile and saved notification settings.
  const loadProfile = async () => {
    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);

      const savedName =
        currentUser?.user_metadata?.full_name || "";

      setName(savedName);
      setEditName(savedName);

      const settings = await getReminderSettings();

      setReminderEnabled(settings.enabled);
      setSelectedDays(
        settings.days || [1, 2, 3, 4, 5, 6, 7]
      );
      setHour(settings.hour ?? 20);
      setMinute(settings.minute ?? 0);
    } catch (error) {
      console.error("Profile loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Update profile name.
  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateProfile(editName);

      setUser(updatedUser);
      setName(
        updatedUser.user_metadata?.full_name || editName.trim()
      );

      setModalVisible(false);

      Alert.alert("Success", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Update failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  // Enable or disable reminders.
  const handleNotificationToggle = async (value) => {
    if (notificationLoading) return;

    setNotificationLoading(true);

    try {
      if (value) {
        const result = await scheduleWasteReminders({
          days: selectedDays,
          hour,
          minute,
        });

        if (!result.success) {
          Alert.alert(
            "Permission required",
            "Please allow notifications for WasteWatcher in your phone settings."
          );
          return;
        }

        setReminderEnabled(true);

        Alert.alert(
          "Reminders enabled",
          "WasteWatcher will remind you to segregate your waste."
        );
      } else {
        await disableWasteReminders();

        setReminderEnabled(false);

        Alert.alert(
          "Reminders disabled",
          "Your scheduled reminders have been cancelled."
        );
      }
    } catch (error) {
      Alert.alert("Notification error", error.message);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Select reminder days.
  const toggleDay = (day) => {
    setSelectedDays((previous) => {
      if (previous.includes(day)) {
        if (previous.length === 1) {
          Alert.alert(
            "Select a day",
            "Please keep at least one reminder day selected."
          );

          return previous;
        }

        return previous.filter((item) => item !== day);
      }

      return [...previous, day].sort((a, b) => a - b);
    });
  };

  // Format reminder time.
  const formatTime = () => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
  };

  const changeHour = (amount) => {
    setHour((previous) => (previous + amount + 24) % 24);
  };

  const changeMinute = (amount) => {
    setMinute((previous) => (previous + amount + 60) % 60);
  };

  // Save the reminder schedule.
  const handleSaveReminder = async () => {
    if (selectedDays.length === 0) {
      Alert.alert(
        "Select days",
        "Choose at least one reminder day."
      );
      return;
    }

    setNotificationLoading(true);

    try {
      const result = await scheduleWasteReminders({
        days: selectedDays,
        hour,
        minute,
      });

      if (!result.success) {
        Alert.alert(
          "Permission required",
          "Allow notifications in your phone settings before saving."
        );
        return;
      }

      setReminderEnabled(true);
      setActiveModal("");

      Alert.alert(
        "Schedule saved",
        `Your reminders are scheduled for ${formatTime()}.`
      );
    } catch (error) {
      Alert.alert(
        "Could not save schedule",
        error.message
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // Logout.
  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of WasteWatcher?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Logout failed", error.message);
            }
          },
        },
      ]
    );
  };

  const displayName = name || "WasteWatcher User";
  const email = user?.email || "Guest mode";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primaryDark}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>ACCOUNT</Text>

      <Text style={styles.title}>Your profile</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={32}
            color={colors.primaryDark}
          />
        </View>

        <Text style={styles.profileName}>
          {displayName}
        </Text>

        <Text style={styles.profileSubtitle}>
          {email}
        </Text>

        <View style={styles.accountBadge}>
          <View style={styles.statusDot} />

          <Text style={styles.accountStatus}>
            {user ? "Registered account" : "Guest account"}
          </Text>
        </View>

        {user && (
          <Pressable
            style={styles.editButton}
            onPress={() => {
              setEditName(name);
              setModalVisible(true);
            }}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={colors.primaryDark}
            />

            <Text style={styles.editButtonText}>
              Edit profile
            </Text>
          </Pressable>
        )}
      </View>

      {/* Preferences */}
      <Text style={styles.sectionTitle}>
        Preferences
      </Text>

      {/* Notifications */}
      <View style={styles.option}>
        <Ionicons
          name="notifications-outline"
          size={21}
          color={colors.primary}
        />

        <Pressable
          style={styles.optionContent}
          onPress={() => setActiveModal("notifications")}
        >
          <Text style={styles.optionText}>
            Notifications
          </Text>

          <Text style={styles.optionSubtitle}>
            {reminderEnabled
              ? `Daily reminder · ${formatTime()}`
              : "Waste segregation reminders"}
          </Text>
        </Pressable>

        {notificationLoading ? (
          <ActivityIndicator color={colors.primaryDark} />
        ) : (
          <Switch
            value={reminderEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{
              false: colors.border,
              true: colors.primaryLight,
            }}
            thumbColor={
              reminderEnabled
                ? colors.primaryDark
                : "#F4F4F4"
            }
          />
        )}

        <Pressable
          onPress={() => setActiveModal("notifications")}
          hitSlop={8}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.muted}
          />
        </Pressable>
      </View>

      {/* About WasteWatcher */}
      <Pressable
        style={styles.option}
        onPress={() => setActiveModal("about")}
      >
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={colors.primary}
        />

        <Text style={styles.optionText}>
          About WasteWatcher
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {/* Logout */}
      {user && (
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.danger}
          />

          <Text style={styles.logoutText}>
            Log out
          </Text>
        </Pressable>
      )}

      <Text style={styles.version}>
        WASTEWATCHER 1.0
      </Text>

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit profile
            </Text>

            <Text style={styles.modalSubtitle}>
              Update your display name.
            </Text>

            <Text style={styles.inputLabel}>
              Full name
            </Text>

            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              maxLength={60}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.saveText}>
                    Save changes
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notifications and About Modals */}
      <Modal
        visible={activeModal !== ""}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal("")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === "notifications"
                  ? "Notification settings"
                  : "About WasteWatcher"}
              </Text>

              <Pressable
                onPress={() => setActiveModal("")}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              {/* Notification Settings */}
              {activeModal === "notifications" && (
                <>
                  <Text style={styles.modalSubtitle}>
                    Choose when WasteWatcher should remind you
                    to segregate your daily waste.
                  </Text>

                  <View style={styles.settingRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>
                        Daily reminders
                      </Text>

                      <Text style={styles.settingDescription}>
                        Get reminders to segregate waste.
                      </Text>
                    </View>

                    <Switch
                      value={reminderEnabled}
                      onValueChange={handleNotificationToggle}
                      trackColor={{
                        false: colors.border,
                        true: colors.primaryLight,
                      }}
                      thumbColor={
                        reminderEnabled
                          ? colors.primaryDark
                          : "#F4F4F4"
                      }
                    />
                  </View>

                  <Text style={styles.inputLabel}>
                    Reminder days
                  </Text>

                  <View style={styles.daysContainer}>
                    {WEEKDAYS.map((day) => {
                      const selected = selectedDays.includes(
                        day.value
                      );

                      return (
                        <Pressable
                          key={day.value}
                          style={[
                            styles.dayButton,
                            selected && styles.dayButtonSelected,
                          ]}
                          onPress={() => toggleDay(day.value)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              selected && styles.dayTextSelected,
                            ]}
                          >
                            {day.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.inputLabel}>
                    Reminder time
                  </Text>

                  <View style={styles.timeContainer}>
                    <View style={styles.timePart}>
                      <Pressable
                        style={styles.timeArrow}
                        onPress={() => changeHour(1)}
                      >
                        <Ionicons
                          name="chevron-up"
                          size={22}
                          color={colors.primaryDark}
                        />
                      </Pressable>

                      <Text style={styles.timeValue}>
                        {String(hour % 12 || 12).padStart(2, "0")}
                      </Text>

                      <Pressable
                        style={styles.timeArrow}
                        onPress={() => changeHour(-1)}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={22}
                          color={colors.primaryDark}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.timeColon}>:</Text>

                    <View style={styles.timePart}>
                      <Pressable
                        style={styles.timeArrow}
                        onPress={() => changeMinute(1)}
                      >
                        <Ionicons
                          name="chevron-up"
                          size={22}
                          color={colors.primaryDark}
                        />
                      </Pressable>

                      <Text style={styles.timeValue}>
                        {String(minute).padStart(2, "0")}
                      </Text>

                      <Pressable
                        style={styles.timeArrow}
                        onPress={() => changeMinute(-1)}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={22}
                          color={colors.primaryDark}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.periodContainer}>
                      <Pressable
                        style={[
                          styles.periodButton,
                          hour < 12 && styles.periodSelected,
                        ]}
                        onPress={() =>
                          setHour((previous) => previous % 12)
                        }
                      >
                        <Text
                          style={[
                            styles.periodText,
                            hour < 12 && styles.periodTextSelected,
                          ]}
                        >
                          AM
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.periodButton,
                          hour >= 12 && styles.periodSelected,
                        ]}
                        onPress={() =>
                          setHour((previous) => (previous % 12) + 12)
                        }
                      >
                        <Text
                          style={[
                            styles.periodText,
                            hour >= 12 && styles.periodTextSelected,
                          ]}
                        >
                          PM
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.timeHint}>
                    Selected time: {formatTime()}
                  </Text>

                  <Pressable
                    style={styles.saveFullButton}
                    onPress={handleSaveReminder}
                    disabled={notificationLoading}
                  >
                    {notificationLoading ? (
                      <ActivityIndicator color={colors.surface} />
                    ) : (
                      <Text style={styles.saveText}>
                        Save reminder schedule
                      </Text>
                    )}
                  </Pressable>
                </>
              )}

              {/* About WasteWatcher */}
              {activeModal === "about" && (
                <>
                  <View style={styles.aboutIcon}>
                    <Ionicons
                      name="leaf-outline"
                      size={40}
                      color={colors.primaryDark}
                    />
                  </View>

                  <Text style={styles.aboutHeading}>
                    WasteWatcher
                  </Text>

                  <Text style={styles.aboutSubtitle}>
                    Smarter waste identification. Cleaner surroundings.
                  </Text>

                  <Text style={styles.aboutText}>
                    WasteWatcher is an AI-powered waste
                    classification application designed to help
                    people identify different types of waste and
                    understand how to dispose of them responsibly.
                  </Text>

                  <Text style={styles.aboutSectionTitle}>
                    Why Waste Segregation Matters
                  </Text>

                  <Text style={styles.aboutText}>
                    Waste segregation means separating different
                    types of waste at the source before disposal.
                    It makes waste management more effective and
                    helps protect our environment.
                  </Text>

                  <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="leaf-outline"
                        size={23}
                        color={colors.primaryDark}
                      />
                    </View>

                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>
                        1. Wet Waste
                      </Text>

                      <Text style={styles.infoDescription}>
                        Food scraps, fruit and vegetable peels,
                        and other biodegradable materials.
                        These can be used for composting.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="recycle-outline"
                        size={23}
                        color={colors.primaryDark}
                      />
                    </View>

                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>
                        2. Dry Waste
                      </Text>

                      <Text style={styles.infoDescription}>
                        Paper, cardboard, plastic, glass and metal.
                        Keep recyclable materials clean and separate.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={23}
                        color={colors.danger}
                      />
                    </View>

                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>
                        3. Hazardous Waste
                      </Text>

                      <Text style={styles.infoDescription}>
                        Batteries, electronic waste and other
                        potentially harmful materials. Keep them
                        separate and use appropriate collection
                        facilities.
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.aboutSectionTitle}>
                    Benefits of Segregation
                  </Text>

                  <View style={styles.benefitsList}>
                    {[
                      "Reduces waste sent to landfills",
                      "Makes recycling easier",
                      "Supports composting",
                      "Reduces environmental contamination",
                      "Encourages responsible waste disposal",
                    ].map((benefit, index) => (
                      <View
                        key={index}
                        style={styles.benefitRow}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={colors.primary}
                        />

                        <Text style={styles.benefitText}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.aboutSectionTitle}>
                    Our Mission
                  </Text>

                  <Text style={styles.aboutText}>
                    To encourage responsible waste management
                    through accessible AI technology and
                    environmental awareness.
                  </Text>

                  <Text style={styles.aboutSectionTitle}>
                    How WasteWatcher Works
                  </Text>

                  <Text style={styles.aboutText}>
                    Capture or select an image. Our on-device AI
                    model analyzes the image and predicts its waste
                    category. The app then provides relevant
                    disposal guidance.
                  </Text>

                  <Text style={styles.aboutFooter}>
                    WASTEWATCHER {"\n"}
                    Version 1.0.0
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 24,
    paddingTop: 35,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
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

  profileCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginTop: 28,
    marginBottom: 35,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    marginTop: 14,
  },

  profileSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },

  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 7,
  },

  accountStatus: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: "600",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginTop: 18,
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },

  option: {
    backgroundColor: colors.surface,
    borderRadius: 13,
    padding: 17,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  optionContent: {
    flex: 1,
  },

  optionText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },

  optionSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 13,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 23,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
  },

  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 7,
    marginBottom: 22,
    lineHeight: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    marginTop: 20,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: colors.text,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },

  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  dayButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  dayButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },

  dayText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  dayTextSelected: {
    color: colors.surface,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 12,
    marginTop: 5,
  },

  timePart: {
    alignItems: "center",
  },

  timeArrow: {
    padding: 5,
  },

  timeValue: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  timeColon: {
    fontSize: 27,
    fontWeight: "700",
    color: colors.text,
  },

  periodContainer: {
    gap: 6,
    marginLeft: 10,
  },

  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },

  periodSelected: {
    backgroundColor: colors.primaryDark,
  },

  periodText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },

  periodTextSelected: {
    color: colors.surface,
  },

  timeHint: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  saveFullButton: {
    height: 50,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 10,
  },

  aboutIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15,
  },

  aboutHeading: {
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginTop: 15,
  },

  aboutSubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: colors.primaryDark,
    marginTop: 7,
    marginBottom: 22,
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 9,
  },

  aboutSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 22,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    gap: 12,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  infoDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 5,
  },

  benefitsList: {
    marginTop: 12,
    gap: 12,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  benefitText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  aboutFooter: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 25,
    marginBottom: 10,
  },
});
