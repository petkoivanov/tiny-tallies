import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { CpaModeIcon } from './CpaModeIcon';
import type { SessionPhase } from '@/services/session';
import type { CpaStage } from '@/services/cpa/cpaTypes';
import type { FeedbackState } from '@/hooks/useSession';

interface SessionHeaderProps {
  sessionPhase: SessionPhase;
  cpaStage: CpaStage;
  currentIndex: number;
  totalProblems: number;
  feedbackState: FeedbackState | null;
  onQuit: () => void;
}

/** Capitalize and format session phase label for the header */
function formatPhaseLabel(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup':
      return 'Warmup';
    case 'practice':
      return 'Practice';
    case 'cooldown':
      return 'Cooldown';
    case 'complete':
      return 'Complete';
  }
}

/** Get progress bar fill color based on session phase */
function getPhaseColor(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup':
      return colors.primaryLight;
    case 'practice':
      return colors.primary;
    case 'cooldown':
      return colors.correct;
    case 'complete':
      return colors.correct;
  }
}

export function SessionHeader({
  sessionPhase,
  cpaStage,
  currentIndex,
  totalProblems,
  feedbackState,
  onQuit,
}: SessionHeaderProps) {
  const progressDone = currentIndex + (feedbackState ? 1 : 0);
  const progressPercent =
    totalProblems > 0 ? (progressDone / totalProblems) * 100 : 0;

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>{formatPhaseLabel(sessionPhase)}</Text>
        <CpaModeIcon stage={cpaStage} />
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalProblems}
        </Text>
        <Pressable
          onPress={onQuit}
          style={styles.quitButton}
          accessibilityRole="button"
          accessibilityLabel="Quit session"
          testID="quit-button"
        >
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer} testID="progress-bar">
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: getPhaseColor(sessionPhase),
              },
            ]}
            testID="progress-bar-fill"
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  phaseLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    minWidth: 80,
  },
  progressText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  quitButton: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: layout.borderRadius.round,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: layout.borderRadius.round,
  },
});
