/**
 * ExpandableSkillDomain — a single domain row that expands to show individual skills.
 *
 * Tapping the domain row toggles an animated expand/collapse of the
 * individual skill list below it.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, typography, layout } from '@/theme';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import type { SkillDefinition } from '@/services/mathEngine/types';

interface SkillStatus {
  skill: SkillDefinition;
  status: 'mastered' | 'in_progress' | 'not_started';
  accuracy: number | null;
}

interface ExpandableSkillDomainProps {
  domainLabel: string;
  skills: SkillDefinition[];
  skillStates: Record<string, SkillState>;
  masteredCount: number;
  totalCount: number;
  inProgressCount: number;
}

export function ExpandableSkillDomain({
  domainLabel,
  skills,
  skillStates,
  masteredCount,
  totalCount,
  inProgressCount,
}: ExpandableSkillDomainProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const skillStatuses: SkillStatus[] = useMemo(() => {
    return skills.map((skill) => {
      const state = skillStates[skill.id];
      let status: 'mastered' | 'in_progress' | 'not_started';
      let accuracy: number | null = null;

      if (!state || state.attempts === 0) {
        status = 'not_started';
      } else if (state.masteryLocked) {
        status = 'mastered';
        accuracy = state.correct / state.attempts;
      } else {
        status = 'in_progress';
        accuracy = state.correct / state.attempts;
      }

      return { skill, status, accuracy };
    });
  }, [skills, skillStates]);

  const masteredPct = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;
  const inProgressPct = totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: spacing.xs,
        },
        domainRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          minHeight: layout.minTouchTarget,
        },
        domainName: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.md,
          color: colors.textPrimary,
          flex: 1,
        },
        domainCount: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textMuted,
        },
        progressBarBackground: {
          height: 8,
          backgroundColor: colors.backgroundLight,
          borderRadius: layout.borderRadius.round,
          overflow: 'hidden',
          flexDirection: 'row',
        },
        masteredFill: {
          height: '100%',
          backgroundColor: colors.correct,
        },
        inProgressFill: {
          height: '100%',
          backgroundColor: colors.primary,
        },
        skillList: {
          paddingLeft: spacing.lg,
          gap: spacing.xs,
        },
        skillRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.xs,
        },
        statusDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        skillName: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          flex: 1,
        },
        accuracyText: {
          fontFamily: typography.fontFamily.regular,
          fontSize: typography.fontSize.xs,
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  const statusColor = (status: SkillStatus['status']) => {
    switch (status) {
      case 'mastered':
        return colors.correct;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.backgroundLight;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.domainRow}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${domainLabel}, ${masteredCount} of ${totalCount} mastered. Tap to ${expanded ? 'collapse' : 'expand'}`}
        testID={`domain-${domainLabel.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {expanded ? (
          <ChevronDown size={16} color={colors.textMuted} />
        ) : (
          <ChevronRight size={16} color={colors.textMuted} />
        )}
        <Text style={styles.domainName}>{domainLabel}</Text>
        <Text style={styles.domainCount}>
          {masteredCount}/{totalCount}
        </Text>
      </Pressable>

      <View style={styles.progressBarBackground}>
        {masteredPct > 0 && (
          <View style={[styles.masteredFill, { width: `${masteredPct}%` }]} />
        )}
        {inProgressPct > 0 && (
          <View style={[styles.inProgressFill, { width: `${inProgressPct}%` }]} />
        )}
      </View>

      {expanded && (
        <View style={styles.skillList} testID={`skills-${domainLabel.toLowerCase().replace(/\s+/g, '-')}`}>
          {skillStatuses.map(({ skill, status, accuracy }) => (
            <View key={skill.id} style={styles.skillRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor(status) },
                ]}
              />
              <Text style={styles.skillName}>{skill.name}</Text>
              {accuracy !== null && (
                <Text style={styles.accuracyText}>
                  {Math.round(accuracy * 100)}%
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
