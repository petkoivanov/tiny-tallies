import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { getSkillsByOperation } from '@/services/mathEngine/skills';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { useTheme, spacing, typography, layout } from '@/theme';
import { skillMapColors } from './skillMapColors';
import type { DomainMeta } from './domainGroups';

interface DomainCardProps {
  meta: DomainMeta;
  skillStates: Record<string, SkillState>;
  onPress: () => void;
}

export const DomainCard = React.memo(function DomainCard({
  meta,
  skillStates,
  onPress,
}: DomainCardProps) {
  const { colors } = useTheme();
  const domainColors = skillMapColors[meta.domain];

  const { total, mastered, inProgress, gradeMin, gradeMax } = useMemo(() => {
    const skills = getSkillsByOperation(meta.domain);
    let m = 0;
    let ip = 0;
    let gMin = 12;
    let gMax = 1;
    for (const skill of skills) {
      const state = getOrCreateSkillState(skillStates, skill.id);
      if (state.masteryLocked) m++;
      else if (state.attempts > 0) ip++;
      if (skill.grade < gMin) gMin = skill.grade;
      if (skill.grade > gMax) gMax = skill.grade;
    }
    return { total: skills.length, mastered: m, inProgress: ip, gradeMin: gMin, gradeMax: gMax };
  }, [meta.domain, skillStates]);

  const progressPercent = total > 0 ? (mastered / total) * 100 : 0;
  const allMastered = mastered === total;
  const hasActivity = mastered > 0 || inProgress > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: allMastered
            ? '#fbbf24'
            : hasActivity
              ? domainColors.lighter
              : colors.surfaceLight,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.displayName}: ${mastered} of ${total} mastered`}
    >
      {/* Color accent bar */}
      <View style={[styles.accent, { backgroundColor: domainColors.primary }]} />

      <View style={styles.content}>
        {/* Top row: emoji + name + chevron */}
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <View style={styles.nameCol}>
            <Text
              style={[styles.name, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {meta.displayName}
            </Text>
            <Text style={[styles.gradeLabel, { color: colors.textMuted }]}>
              {gradeMin === gradeMax ? `Grade ${gradeMin}` : `Grades ${gradeMin}\u2013${gradeMax}`}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(progressPercent > 0 ? 3 : 0, progressPercent)}%`,
                backgroundColor: allMastered ? '#fbbf24' : domainColors.primary,
              },
            ]}
          />
        </View>

        {/* Progress text */}
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {mastered}/{total} mastered
          {inProgress > 0 ? ` \u00B7 ${inProgress} in progress` : ''}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: layout.borderRadius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  accent: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
  },
  gradeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginTop: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: layout.borderRadius.round,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: 6,
    borderRadius: layout.borderRadius.round,
  },
  progressText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
});

export default DomainCard;
