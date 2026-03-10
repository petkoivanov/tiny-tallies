/**
 * BenchmarkSection — opt-in peer benchmarking demographics.
 *
 * Collects age range and US state for anonymous peer comparison.
 * All fields are optional; the entire section is disabled until
 * the parent explicitly opts in via a toggle.
 */

import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Users } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import { useAppStore } from '@/store/appStore';
import type { AgeRange } from '@/store/slices/childProfileSlice';

const AGE_RANGE_OPTIONS: { label: string; value: AgeRange }[] = [
  { label: '6–7', value: '6-7' },
  { label: '7–8', value: '7-8' },
  { label: '8–9', value: '8-9' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

interface BenchmarkSectionProps {
  sectionStyle: ViewStyle;
  sectionHeaderStyle: ViewStyle;
  sectionTitleStyle: TextStyle;
  cardStyle: ViewStyle;
  rowStyle: ViewStyle;
  rowLabelStyle: TextStyle;
  rowSublabelStyle: TextStyle;
  dividerStyle: ViewStyle;
}

export function BenchmarkSection({
  sectionStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  cardStyle,
  rowStyle,
  rowLabelStyle,
  rowSublabelStyle,
  dividerStyle,
}: BenchmarkSectionProps) {
  const { colors } = useTheme();
  const benchmarkOptIn = useAppStore((s) => s.benchmarkOptIn);
  const setBenchmarkOptIn = useAppStore((s) => s.setBenchmarkOptIn);
  const ageRange = useAppStore((s) => s.ageRange);
  const setAgeRange = useAppStore((s) => s.setAgeRange);
  const stateCode = useAppStore((s) => s.stateCode);
  const setStateCode = useAppStore((s) => s.setStateCode);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        chipRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        },
        chip: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: layout.borderRadius.md,
          backgroundColor: colors.backgroundLight,
          minHeight: layout.minTouchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        chipActive: {
          backgroundColor: colors.primary,
        },
        chipText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        },
        chipTextActive: {
          color: '#fff',
        },
        stateGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
        },
        stateChip: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: layout.borderRadius.sm,
          backgroundColor: colors.backgroundLight,
          minWidth: 44,
          minHeight: 36,
          justifyContent: 'center',
          alignItems: 'center',
        },
        stateChipActive: {
          backgroundColor: colors.primary,
        },
        stateChipText: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
          color: colors.textSecondary,
        },
        stateChipTextActive: {
          color: '#fff',
        },
        fieldLabel: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.sm,
          color: colors.textPrimary,
          marginBottom: spacing.xs,
        },
      }),
    [colors],
  );

  return (
    <View style={sectionStyle}>
      <View style={sectionHeaderStyle}>
        <Users size={20} color={colors.primary} />
        <Text style={sectionTitleStyle}>Peer Benchmarking</Text>
      </View>
      <View style={cardStyle}>
        {/* Opt-in toggle */}
        <View style={rowStyle}>
          <Text style={rowLabelStyle}>Compare with peers</Text>
          <Switch
            value={benchmarkOptIn}
            onValueChange={setBenchmarkOptIn}
            testID="benchmark-opt-in-toggle"
          />
        </View>
        <Text style={rowSublabelStyle}>
          {benchmarkOptIn
            ? 'Anonymous comparison shows how your child ranks by age group and state.'
            : 'Opt in to see how your child compares with peers. No personal data is shared.'}
        </Text>

        {benchmarkOptIn && (
          <>
            <View style={dividerStyle} />

            {/* Age range */}
            <View>
              <Text style={styles.fieldLabel}>Age range</Text>
              <View style={styles.chipRow}>
                {AGE_RANGE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.chip,
                      ageRange === opt.value && styles.chipActive,
                    ]}
                    onPress={() =>
                      setAgeRange(ageRange === opt.value ? null : opt.value)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Age range ${opt.label}`}
                    testID={`age-range-${opt.value}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        ageRange === opt.value && styles.chipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* State */}
            <View>
              <Text style={styles.fieldLabel}>State (optional)</Text>
              <View style={styles.stateGrid}>
                {US_STATES.map((st) => (
                  <Pressable
                    key={st}
                    style={[
                      styles.stateChip,
                      stateCode === st && styles.stateChipActive,
                    ]}
                    onPress={() =>
                      setStateCode(stateCode === st ? null : st)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={st}
                    testID={`state-${st}`}
                  >
                    <Text
                      style={[
                        styles.stateChipText,
                        stateCode === st && styles.stateChipTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
