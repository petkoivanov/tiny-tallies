/**
 * TimeLimitsSection — parental controls for daily limit, bedtime, break reminders.
 * Extracted from ParentalControlsScreen to stay under 500-line limit.
 */

import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';

const DAILY_LIMIT_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const BEDTIME_OPTIONS = [
  { label: '7pm\u20136am', start: '19:00', end: '06:00' },
  { label: '8pm\u20137am', start: '20:00', end: '07:00' },
  { label: '9pm\u20137am', start: '21:00', end: '07:00' },
];

const BREAK_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
];

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

export function TimeLimitsSection({
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

  const dailyLimitMinutes = useAppStore((s) => s.dailyLimitMinutes);
  const setDailyLimitMinutes = useAppStore((s) => s.setDailyLimitMinutes);
  const bedtimeWindow = useAppStore((s) => s.bedtimeWindow);
  const setBedtimeWindow = useAppStore((s) => s.setBedtimeWindow);
  const breakReminderMinutes = useAppStore((s) => s.breakReminderMinutes);
  const setBreakReminderMinutes = useAppStore((s) => s.setBreakReminderMinutes);

  return (
    <View style={sectionStyle}>
      <View style={sectionHeaderStyle}>
        <Clock size={20} color={colors.primary} />
        <Text style={sectionTitleStyle}>Time & Limits</Text>
      </View>
      <View style={cardStyle}>
        {/* Daily limit */}
        <View>
          <Text style={rowLabelStyle}>Daily practice limit</Text>
          <Text style={rowSublabelStyle}>
            {dailyLimitMinutes === 0
              ? 'No limit set'
              : `${dailyLimitMinutes} minutes per day`}
          </Text>
          <View style={styles.optionRow}>
            {DAILY_LIMIT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      dailyLimitMinutes === opt.value
                        ? colors.primary
                        : colors.surfaceLight,
                  },
                ]}
                onPress={() => setDailyLimitMinutes(opt.value)}
                accessibilityRole="button"
                testID={`daily-limit-${opt.value}`}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    {
                      color:
                        dailyLimitMinutes === opt.value
                          ? '#fff'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={dividerStyle} />

        {/* Bedtime lockout */}
        <View>
          <View style={rowStyle}>
            <Text style={rowLabelStyle}>Bedtime lockout</Text>
            <Switch
              value={bedtimeWindow !== null}
              onValueChange={(val) =>
                setBedtimeWindow(
                  val ? { start: '20:00', end: '07:00' } : null,
                )
              }
              testID="bedtime-toggle"
            />
          </View>
          <Text style={rowSublabelStyle}>
            {bedtimeWindow
              ? `No practice ${bedtimeWindow.start} \u2013 ${bedtimeWindow.end}`
              : 'Allow practice at any time'}
          </Text>
          {bedtimeWindow && (
            <View style={styles.optionRow}>
              {BEDTIME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.label}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor:
                        bedtimeWindow.start === opt.start &&
                        bedtimeWindow.end === opt.end
                          ? colors.primary
                          : colors.surfaceLight,
                    },
                  ]}
                  onPress={() =>
                    setBedtimeWindow({ start: opt.start, end: opt.end })
                  }
                  accessibilityRole="button"
                  testID={`bedtime-${opt.label.replace(/\s/g, '-')}`}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      {
                        color:
                          bedtimeWindow.start === opt.start &&
                          bedtimeWindow.end === opt.end
                            ? '#fff'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={dividerStyle} />

        {/* Break reminders */}
        <View>
          <Text style={rowLabelStyle}>Break reminders</Text>
          <Text style={rowSublabelStyle}>
            {breakReminderMinutes === 0
              ? 'No reminders'
              : `Remind every ${breakReminderMinutes} minutes`}
          </Text>
          <View style={styles.optionRow}>
            {BREAK_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      breakReminderMinutes === opt.value
                        ? colors.primary
                        : colors.surfaceLight,
                  },
                ]}
                onPress={() => setBreakReminderMinutes(opt.value)}
                accessibilityRole="button"
                testID={`break-${opt.value}`}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    {
                      color:
                        breakReminderMinutes === opt.value
                          ? '#fff'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  optionChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: layout.borderRadius.round,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
});
