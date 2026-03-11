/**
 * ReminderSection — daily practice reminder toggle and time picker
 * for the parental controls screen.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import {
  ReminderService,
  REMINDER_TIME_OPTIONS,
} from '@/services/reminder/reminderService';
import { AppDialog } from '@/components/AppDialog';

interface Props {
  sectionStyle: object;
  sectionHeaderStyle: object;
  sectionTitleStyle: object;
  cardStyle: object;
  rowStyle: object;
  rowLabelStyle: object;
  rowSublabelStyle: object;
  dividerStyle: object;
}

export function ReminderSection({
  sectionStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  cardStyle,
  rowStyle,
  rowLabelStyle,
  rowSublabelStyle,
  dividerStyle,
}: Props) {
  const { colors } = useTheme();
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderTime = useAppStore((s) => s.reminderTime);
  const setReminderEnabled = useAppStore((s) => s.setReminderEnabled);
  const setReminderTime = useAppStore((s) => s.setReminderTime);

  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await ReminderService.requestPermissions();
        if (!granted) {
          setPermissionDenied(true);
          return;
        }
        await ReminderService.scheduleReminder(reminderTime);
      } else {
        await ReminderService.cancelReminder();
      }
      setReminderEnabled(enabled);
    },
    [reminderTime, setReminderEnabled],
  );

  const handleTimeChange = useCallback(
    async (time: string) => {
      setReminderTime(time);
      if (reminderEnabled) {
        await ReminderService.scheduleReminder(time);
      }
    },
    [reminderEnabled, setReminderTime],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        timeGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginTop: spacing.sm,
        },
        timeButton: {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: layout.borderRadius.md,
          backgroundColor: colors.backgroundLight,
          minHeight: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        timeButtonActive: {
          backgroundColor: colors.primary,
        },
        timeButtonText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        timeButtonTextActive: {
          color: '#fff',
        },
        benefitText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.primary,
          textAlign: 'center',
          marginTop: spacing.sm,
          lineHeight: 20,
        },
      }),
    [colors],
  );

  return (
    <View style={sectionStyle}>
      <View style={sectionHeaderStyle}>
        <Bell size={20} color={colors.primary} />
        <Text style={sectionTitleStyle}>Daily Reminder</Text>
      </View>
      <View style={cardStyle}>
        <View style={rowStyle}>
          <Text style={rowLabelStyle}>Practice reminder</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggle}
            testID="reminder-toggle"
          />
        </View>
        <Text style={rowSublabelStyle}>
          {reminderEnabled
            ? 'A daily notification reminds your child to practice math.'
            : 'Daily practice reminders are turned off.'}
        </Text>

        {reminderEnabled && (
          <>
            <View style={dividerStyle} />
            <Text style={rowSublabelStyle}>Reminder time</Text>
            <View style={styles.timeGrid} testID="reminder-time-grid">
              {REMINDER_TIME_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.timeButton,
                    reminderTime === option.value && styles.timeButtonActive,
                  ]}
                  onPress={() => handleTimeChange(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set reminder to ${option.label}`}
                  testID={`reminder-time-${option.value}`}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      reminderTime === option.value &&
                        styles.timeButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.benefitText}>
              A daily routine builds strong math habits!
            </Text>
          </>
        )}
      </View>
      <AppDialog
        visible={permissionDenied}
        title="Notifications Disabled"
        message="Please enable notifications in your device settings to use practice reminders."
        buttons={[{ text: 'OK' }]}
        onDismiss={() => setPermissionDenied(false)}
      />
    </View>
  );
}
