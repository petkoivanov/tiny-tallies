import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Lock, Star } from 'lucide-react-native';

import type { SkillDefinition } from '@/services/mathEngine/types';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import { isSkillUnlocked } from '@/services/adaptive/prerequisiteGating';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { useTheme, spacing, typography, layout } from '@/theme';
import { skillMapColors } from './skillMapColors';
import type { DomainMeta } from './domainGroups';
import type { NodeState } from './skillMapTypes';

interface DomainSkillListProps {
  meta: DomainMeta;
  skills: SkillDefinition[];
  skillStates: Record<string, SkillState>;
  onSkillPress: (skillId: string) => void;
}

function getNodeState(
  skillId: string,
  skillStates: Record<string, SkillState>,
): NodeState {
  const state = getOrCreateSkillState(skillStates, skillId);
  if (state.masteryLocked) return 'mastered';
  if (state.attempts > 0) return 'in-progress';
  if (isSkillUnlocked(skillId, skillStates)) return 'unlocked';
  return 'locked';
}

export function DomainSkillList({
  meta,
  skills,
  skillStates,
  onSkillPress,
}: DomainSkillListProps) {
  const { colors } = useTheme();
  const domainColors = skillMapColors[meta.domain];

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.grade - b.grade),
    [skills],
  );

  return (
    <View style={styles.container}>
      {sortedSkills.map((skill) => {
        const state = getNodeState(skill.id, skillStates);
        const skillState = getOrCreateSkillState(skillStates, skill.id);

        return (
          <Pressable
            key={skill.id}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: state === 'mastered'
                  ? '#fbbf24'
                  : state === 'in-progress'
                    ? domainColors.lighter
                    : colors.surfaceLight,
                opacity: state === 'locked' ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={() => onSkillPress(skill.id)}
            accessibilityRole="button"
            accessibilityLabel={`${skill.name}, ${state}`}
          >
            {/* State indicator */}
            <View
              style={[
                styles.stateIcon,
                {
                  backgroundColor:
                    state === 'mastered'
                      ? '#fbbf24'
                      : state === 'in-progress'
                        ? domainColors.light
                        : state === 'unlocked'
                          ? domainColors.lighter
                          : colors.surfaceLight,
                },
              ]}
            >
              {state === 'mastered' && <Check size={14} color="#fff" strokeWidth={3} />}
              {state === 'locked' && <Lock size={12} color={colors.textMuted} />}
              {state === 'in-progress' && <Star size={12} color="#fff" fill="#fff" />}
              {state === 'unlocked' && (
                <View style={[styles.dot, { backgroundColor: domainColors.primary }]} />
              )}
            </View>

            {/* Skill info */}
            <View style={styles.info}>
              <Text
                style={[styles.skillName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {skill.name}
              </Text>
              <Text style={[styles.grade, { color: colors.textMuted }]}>
                Grade {skill.grade}
              </Text>
            </View>

            {/* Mastery bar (for in-progress/mastered) */}
            {(state === 'in-progress' || state === 'mastered') && (
              <View style={[styles.miniBar, { backgroundColor: colors.surfaceLight }]}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: `${Math.max(5, skillState.masteryProbability * 100)}%`,
                      backgroundColor:
                        state === 'mastered' ? '#fbbf24' : domainColors.primary,
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  stateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  skillName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  grade: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    marginTop: 1,
  },
  miniBar: {
    width: 48,
    height: 4,
    borderRadius: layout.borderRadius.round,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 4,
    borderRadius: layout.borderRadius.round,
  },
});

export default DomainSkillList;
