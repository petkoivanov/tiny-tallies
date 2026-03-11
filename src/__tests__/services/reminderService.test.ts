import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  ReminderService,
  REMINDER_TIME_OPTIONS,
  DEFAULT_REMINDER_TIME,
} from '@/services/reminder/reminderService';

const mockGetPermissions =
  Notifications.getPermissionsAsync as jest.MockedFunction<
    typeof Notifications.getPermissionsAsync
  >;
const mockRequestPermissions =
  Notifications.requestPermissionsAsync as jest.MockedFunction<
    typeof Notifications.requestPermissionsAsync
  >;
const mockSchedule =
  Notifications.scheduleNotificationAsync as jest.MockedFunction<
    typeof Notifications.scheduleNotificationAsync
  >;
const mockCancel =
  Notifications.cancelScheduledNotificationAsync as jest.MockedFunction<
    typeof Notifications.cancelScheduledNotificationAsync
  >;
const mockGetAllScheduled =
  Notifications.getAllScheduledNotificationsAsync as jest.MockedFunction<
    typeof Notifications.getAllScheduledNotificationsAsync
  >;

describe('ReminderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({
      status: 'granted',
    } as Notifications.NotificationPermissionsStatus);
  });

  describe('requestPermissions', () => {
    it('returns true when already granted', async () => {
      const result = await ReminderService.requestPermissions();
      expect(result).toBe(true);
      expect(mockRequestPermissions).not.toHaveBeenCalled();
    });

    it('requests permissions when not yet granted', async () => {
      mockGetPermissions.mockResolvedValueOnce({
        status: 'undetermined',
      } as Notifications.NotificationPermissionsStatus);
      mockRequestPermissions.mockResolvedValueOnce({
        status: 'granted',
      } as Notifications.NotificationPermissionsStatus);

      const result = await ReminderService.requestPermissions();
      expect(result).toBe(true);
      expect(mockRequestPermissions).toHaveBeenCalled();
    });

    it('returns false when permissions denied', async () => {
      mockGetPermissions.mockResolvedValueOnce({
        status: 'denied',
      } as Notifications.NotificationPermissionsStatus);
      mockRequestPermissions.mockResolvedValueOnce({
        status: 'denied',
      } as Notifications.NotificationPermissionsStatus);

      const result = await ReminderService.requestPermissions();
      expect(result).toBe(false);
    });

    it('creates Android notification channel', async () => {
      const originalPlatform = Platform.OS;
      Object.defineProperty(Platform, 'OS', { value: 'android' });

      await ReminderService.requestPermissions();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'practice-reminder',
        expect.objectContaining({
          name: 'Practice Reminders',
          importance: Notifications.AndroidImportance.HIGH,
        }),
      );

      Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    });

    it('returns false on error', async () => {
      mockGetPermissions.mockRejectedValueOnce(new Error('fail'));
      const result = await ReminderService.requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('scheduleReminder', () => {
    it('cancels existing and schedules new daily notification', async () => {
      const result = await ReminderService.scheduleReminder('17:00');

      expect(result).toBe(true);
      expect(mockCancel).toHaveBeenCalledWith('practice-reminder');
      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'practice-reminder',
          content: expect.objectContaining({
            title: 'Math Time!',
          }),
          trigger: expect.objectContaining({
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 17,
            minute: 0,
          }),
        }),
      );
    });

    it('parses time correctly', async () => {
      await ReminderService.scheduleReminder('15:30');

      expect(mockSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            hour: 15,
            minute: 30,
          }),
        }),
      );
    });

    it('returns false on error', async () => {
      mockSchedule.mockRejectedValueOnce(new Error('fail'));
      const result = await ReminderService.scheduleReminder('17:00');
      expect(result).toBe(false);
    });
  });

  describe('cancelReminder', () => {
    it('cancels the practice-reminder notification', async () => {
      await ReminderService.cancelReminder();
      expect(mockCancel).toHaveBeenCalledWith('practice-reminder');
    });

    it('does not throw on error', async () => {
      mockCancel.mockRejectedValueOnce(new Error('fail'));
      await expect(ReminderService.cancelReminder()).resolves.toBeUndefined();
    });
  });

  describe('isReminderScheduled', () => {
    it('returns true when practice-reminder is scheduled', async () => {
      mockGetAllScheduled.mockResolvedValueOnce([
        { identifier: 'practice-reminder' },
      ] as unknown as Notifications.NotificationRequest[]);

      const result = await ReminderService.isReminderScheduled();
      expect(result).toBe(true);
    });

    it('returns false when no matching notification', async () => {
      mockGetAllScheduled.mockResolvedValueOnce([]);
      const result = await ReminderService.isReminderScheduled();
      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      mockGetAllScheduled.mockRejectedValueOnce(new Error('fail'));
      const result = await ReminderService.isReminderScheduled();
      expect(result).toBe(false);
    });
  });
});

describe('REMINDER_TIME_OPTIONS', () => {
  it('has 7 preset time options', () => {
    expect(REMINDER_TIME_OPTIONS).toHaveLength(7);
  });

  it('each option has label and value', () => {
    for (const option of REMINDER_TIME_OPTIONS) {
      expect(option.label).toBeDefined();
      expect(option.value).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});

describe('DEFAULT_REMINDER_TIME', () => {
  it('is 17:00', () => {
    expect(DEFAULT_REMINDER_TIME).toBe('17:00');
  });
});
