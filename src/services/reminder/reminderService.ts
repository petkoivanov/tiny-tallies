import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const PRACTICE_REMINDER_ID = 'practice-reminder';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Reminder Service — schedules and manages daily practice reminder notifications.
 */
export const ReminderService = {
  /** Request notification permissions. Returns true if granted. */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return false;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('practice-reminder', {
          name: 'Practice Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Schedule daily practice reminder.
   * @param time — 24hr "HH:MM" format (e.g. "17:00")
   */
  scheduleReminder: async (time: string): Promise<boolean> => {
    try {
      await ReminderService.cancelReminder();

      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        identifier: PRACTICE_REMINDER_ID,
        content: {
          title: 'Math Time!',
          body: "Time for a quick math practice session — let's keep that streak going!",
          data: { type: 'practice-reminder' },
          sound: true,
          ...(Platform.OS === 'android' && {
            channelId: 'practice-reminder',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      return true;
    } catch {
      return false;
    }
  },

  /** Cancel the practice reminder. */
  cancelReminder: async (): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        PRACTICE_REMINDER_ID,
      );
    } catch {
      // Ignore — notification may not exist
    }
  },

  /** Check if a practice reminder is currently scheduled. */
  isReminderScheduled: async (): Promise<boolean> => {
    try {
      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.some((n) => n.identifier === PRACTICE_REMINDER_ID);
    } catch {
      return false;
    }
  },
};

/** Preset time options for the reminder picker. */
export const REMINDER_TIME_OPTIONS = [
  { label: '3:00 PM', value: '15:00' },
  { label: '3:30 PM', value: '15:30' },
  { label: '4:00 PM', value: '16:00' },
  { label: '4:30 PM', value: '16:30' },
  { label: '5:00 PM', value: '17:00' },
  { label: '5:30 PM', value: '17:30' },
  { label: '6:00 PM', value: '18:00' },
] as const;

export const DEFAULT_REMINDER_TIME = '17:00';
