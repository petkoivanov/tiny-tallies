/**
 * SkillDetailOverlay: Modal overlay showing child-friendly skill mastery details.
 *
 * Displays progress bar (driven by BKT probability, not shown as raw number),
 * practice level stars (1-6 Leitner box), and prerequisite checklist for locked
 * skills. Follows the centered modal pattern from BadgeDetailOverlay.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

import { getSkillById } from '@/services/mathEngine/skills';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';
import { getNodeState } from './skillMapLayout';
import { skillMapColors } from './skillMapColors';
import { colors, spacing, typography, layout } from '@/theme';

export interface SkillDetailOverlayProps {
  skillId: string | null;
  skillStates: Record<string, SkillState>;
  onClose: () => void;
}

/** Operation emoji mapping. */
const OPERATION_EMOJI: Record<string, string> = {
  addition: '+',
  subtraction: '-',
};

/** Star colors. */
const STAR_FILLED_COLOR = '#fbbf24';
const STAR_EMPTY_COLOR = '#475569';

/** Total practice level stars. */
const TOTAL_STARS = 6;

export function SkillDetailOverlay({
  skillId,
  skillStates,
  onClose,
}: SkillDetailOverlayProps) {
  if (!skillId) return null;

  const skill = getSkillById(skillId);
  if (!skill) return null;

  const skillState = getOrCreateSkillState(skillStates, skillId);
  const nodeState = getNodeState(skillId, skillStates);
  const operationEmoji = OPERATION_EMOJI[skill.operation] ?? '?';
  const opColors = skillMapColors[skill.operation];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="overlay-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Close button */}
          <Pressable
            testID="overlay-close"
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>X</Text>
          </Pressable>

          {/* Operation emoji circle */}
          <View
            style={[styles.emojiCircle, { backgroundColor: opColors.primary }]}
          >
            <Text style={styles.emojiText}>{operationEmoji}</Text>
          </View>

          {/* Skill name */}
          <Text style={styles.skillName}>{skill.name}</Text>

          {/* Grade label */}
          <Text style={styles.gradeLabel}>Grade {skill.grade}</Text>

          {/* State-specific content */}
          {nodeState === 'locked' && (
            <LockedContent
              skillId={skillId}
              skillStates={skillStates}
            />
          )}

          {nodeState === 'unlocked' && (
            <UnlockedContent />
          )}

          {nodeState === 'in-progress' && (
            <InProgressContent
              masteryProbability={skillState.masteryProbability}
              leitnerBox={skillState.leitnerBox}
              opTintLight={opColors.light}
            />
          )}

          {nodeState === 'mastered' && (
            <MasteredContent />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Content for locked skills: prerequisite checklist. */
function LockedContent({
  skillId,
  skillStates,
}: {
  skillId: string;
  skillStates: Record<string, SkillState>;
}) {
  const skill = getSkillById(skillId);
  if (!skill) return null;

  return (
    <>
      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Complete these skills first:</Text>
      {skill.prerequisites.map((prereqId) => {
        const prereqSkill = getSkillById(prereqId);
        const prereqState = getNodeState(prereqId, skillStates);
        const isMastered = prereqState === 'mastered';

        return (
          <View key={prereqId} style={styles.prereqRow}>
            <Text style={styles.prereqIcon}>
              {isMastered ? '\u2705' : '\u274C'}
            </Text>
            <Text style={styles.prereqName}>
              {prereqSkill?.name ?? prereqId}
            </Text>
          </View>
        );
      })}
    </>
  );
}

/** Content for unlocked skills with no attempts. */
function UnlockedContent() {
  return (
    <>
      <Text style={styles.readyText}>Ready to learn!</Text>
      <ProgressBar fill={0} color={STAR_FILLED_COLOR} />
      <Text style={styles.sectionLabel}>Practice level</Text>
      <StarsRow filledCount={1} />
    </>
  );
}

/** Content for in-progress skills. */
function InProgressContent({
  masteryProbability,
  leitnerBox,
  opTintLight,
}: {
  masteryProbability: number;
  leitnerBox: number;
  opTintLight: string;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>How well you know this!</Text>
      <ProgressBar fill={masteryProbability} color={opTintLight} />
      <Text style={styles.sectionLabel}>Practice level</Text>
      <StarsRow filledCount={leitnerBox} />
    </>
  );
}

/** Content for mastered skills: celebration display. */
function MasteredContent() {
  return (
    <>
      <Text style={styles.trophyEmoji}>{'\u{1F3C6}'}</Text>
      <Text style={styles.masteredText}>Mastered!</Text>
      <ProgressBar fill={1} color={STAR_FILLED_COLOR} />
      <StarsRow filledCount={TOTAL_STARS} />
      <Text style={styles.encourageText}>You're a pro at this!</Text>
    </>
  );
}

/** Progress bar driven by fill (0-1). No raw numbers shown. */
function ProgressBar({ fill, color }: { fill: number; color: string }) {
  const widthPercent = Math.max(fill > 0 ? 2 : 0, fill * 100);

  return (
    <View style={styles.progressBarOuter}>
      <View
        style={[
          styles.progressBarInner,
          {
            width: `${widthPercent}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

/** Row of 6 star icons (filled vs empty). */
function StarsRow({ filledCount }: { filledCount: number }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: TOTAL_STARS }, (_, i) => (
        <Star
          key={i}
          size={20}
          color={i < filledCount ? STAR_FILLED_COLOR : STAR_EMPTY_COLOR}
          fill={i < filledCount ? STAR_FILLED_COLOR : 'transparent'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emojiText: {
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  skillName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    textAlign: 'center',
  },
  gradeLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.surfaceLight,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  prereqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  prereqIcon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  prereqName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  readyText: {
    color: colors.primaryLight,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  progressBarOuter: {
    width: '100%',
    height: 12,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: 12,
    borderRadius: layout.borderRadius.round,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  trophyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  masteredText: {
    color: STAR_FILLED_COLOR,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.md,
  },
  encourageText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
