
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDER_IDS_KEY = "wastewatcher_reminder_ids";
const REMINDER_SETTINGS_KEY = "wastewatcher_reminder_settings";

const CHANNEL_ID = "waste-reminders-v2";

const DEFAULT_SETTINGS = {
  enabled: false,
  hour: 20,
  minute: 0,
  days: [1, 2, 3, 4, 5, 6, 7],
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications() {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Waste Segregation Reminders",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function getReminderSettings() {
  try {
    const saved = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Could not load reminder settings:", error);
    return DEFAULT_SETTINGS;
  }
}

async function requestNotificationPermission() {
  await configureNotifications();

  let permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    permission = await Notifications.requestPermissionsAsync();
  }

  return permission.granted;
}

export async function cancelWasteReminders() {
  try {
    const savedIds = await AsyncStorage.getItem(REMINDER_IDS_KEY);
    const ids = savedIds ? JSON.parse(savedIds) : [];

    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    await AsyncStorage.removeItem(REMINDER_IDS_KEY);
  } catch (error) {
    console.error("Could not cancel reminders:", error);
    throw error;
  }
}

export async function scheduleWasteReminders({
  days,
  hour,
  minute,
}) {
  if (!Array.isArray(days) || days.length === 0) {
    throw new Error("Please select at least one reminder day.");
  }

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Please select a valid reminder time.");
  }

  const uniqueDays = [...new Set(days)];

  if (uniqueDays.some(
    (day) => !Number.isInteger(day) || day < 1 || day > 7
  )) {
    throw new Error("Invalid reminder day.");
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return {
      success: false,
      reason: "permission-denied",
    };
  }

  await cancelWasteReminders();

  const scheduledIds = [];

  for (const weekday of uniqueDays) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "WasteWatcher Reminder",
        body:
          "Have you segregated today's waste? Keep wet, dry and hazardous waste separate before handing it over for collection.",
        data: {
          screen: "Home",
          type: "waste-segregation-reminder",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });

    scheduledIds.push(id);
  }

  await AsyncStorage.setItem(
    REMINDER_IDS_KEY,
    JSON.stringify(scheduledIds)
  );

  await AsyncStorage.setItem(
    REMINDER_SETTINGS_KEY,
    JSON.stringify({
      enabled: true,
      hour,
      minute,
      days: uniqueDays,
    })
  );

  const allScheduled =
    await Notifications.getAllScheduledNotificationsAsync();

  console.log("WasteWatcher reminders scheduled:", scheduledIds);
  console.log("Total scheduled notifications:", allScheduled.length);
  console.log(
    "WasteWatcher scheduled notifications:",
    allScheduled.filter((item) =>
      item.content.data?.type === "waste-segregation-reminder"
    )
  );

  return {
    success: true,
    scheduledCount: scheduledIds.length,
  };
}

export async function disableWasteReminders() {
  await cancelWasteReminders();

  const settings = await getReminderSettings();

  await AsyncStorage.setItem(
    REMINDER_SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      enabled: false,
    })
  );

  return true;
}
