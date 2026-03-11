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
import { StateSelector } from '@/components/shared/StateSelector';
import type { AgeRange } from '@/store/slices/childProfileSlice';

const AGE_RANGE_OPTIONS: { label: string; value: AgeRange }[] = [
  { label: '6–7', value: '6-7' },
  { label: '7–8', value: '7-8' },
  { label: '8–9', value: '8-9' },
];

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
            : 'Turn off to hide peer comparison. No personal data is shared.'}
        </Text>

        {benchmarkOptIn && (
          <>
            <View style={dividerStyle} />
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

            <View>
              <Text style={styles.fieldLabel}>State (optional)</Text>
              <StateSelector
                value={stateCode}
                onChange={setStateCode}
                activeColor={colors.primary}
                inactiveColor={colors.backgroundLight}
                activeBorderColor={colors.primary}
                inactiveBorderColor={colors.backgroundLight}
                activeTextColor="#fff"
                inactiveTextColor={colors.textSecondary}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
