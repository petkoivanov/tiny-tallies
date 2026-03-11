import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { ReminderService } from '@/services/reminder/reminderService';

/**
 * Initializes the daily practice reminder on app start.
 * If reminders are enabled but not yet scheduled, requests permissions
 * and schedules the notification. Runs only once per app session.
 */
export function useReminderInit(): void {
  const initialized = useRef(false);
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderTime = useAppStore((s) => s.reminderTime);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!reminderEnabled) return;

    (async () => {
      const alreadyScheduled = await ReminderService.isReminderScheduled();
      if (alreadyScheduled) return;

      const hasPermission = await ReminderService.requestPermissions();
      if (hasPermission) {
        await ReminderService.scheduleReminder(reminderTime);
      }
    })();
  }, [reminderEnabled, reminderTime]);
}
