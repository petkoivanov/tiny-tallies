/**
 * useAbsenceCheck — checks for skill decay due to extended absence.
 *
 * On mount, computes absence decay for all practiced skills and determines
 * if a re-assessment should be suggested. Also applies decay to the store
 * (one-time on mount) if decay is detected.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  calculateAbsenceDecay,
  daysSince,
  shouldSuggestReassessment,
} from '@/services/cat/absenceDecay';
import type { DecayResult } from '@/services/cat/absenceDecay';

interface AbsenceCheckResult {
  /** Whether re-assessment should be suggested to the user */
  suggestReassessment: boolean;
  /** Number of skills with significant decay */
  decayedSkillCount: number;
  /** Days since last practice */
  daysSinceLastPractice: number;
}

export function useAbsenceCheck(): AbsenceCheckResult {
  const lastPracticeDate = useAppStore((s) => s.lastPracticeDate);
  const placementComplete = useAppStore((s) => s.placementComplete);
  const skillStates = useAppStore((s) => s.skillStates);
  const updateSkillState = useAppStore((s) => s.updateSkillState);

  const hasAppliedDecay = useRef(false);

  const absent = useMemo(() => {
    if (!lastPracticeDate) return 0;
    return daysSince(lastPracticeDate);
  }, [lastPracticeDate]);

  const decayResults = useMemo((): DecayResult[] => {
    if (!placementComplete || absent <= 3) return [];

    return Object.entries(skillStates)
      .filter(([, state]) => state.attempts > 0)
      .map(([, state]) =>
        calculateAbsenceDecay({
          eloRating: state.eloRating,
          masteryProbability: state.masteryProbability,
          leitnerBox: state.leitnerBox,
          masteryLocked: state.masteryLocked,
          daysSinceLastPractice: absent,
        }),
      );
  }, [placementComplete, absent, skillStates]);

  // Apply decay to store (once per mount)
  useEffect(() => {
    if (hasAppliedDecay.current || decayResults.length === 0 || absent <= 3) {
      return;
    }

    const entries = Object.entries(skillStates).filter(
      ([, state]) => state.attempts > 0,
    );

    let anyDecayed = false;
    entries.forEach(([skillId, state], i) => {
      const result = decayResults[i];
      if (result && result.eloDecay > 0) {
        updateSkillState(skillId, {
          eloRating: result.newElo,
          masteryProbability: result.newMasteryProbability,
          masteryLocked: result.breakMasteryLock
            ? false
            : state.masteryLocked,
        });
        anyDecayed = true;
      }
    });

    if (anyDecayed) {
      hasAppliedDecay.current = true;
    }
  }, [decayResults, absent, skillStates, updateSkillState]);

  const suggest = useMemo(
    () => shouldSuggestReassessment(decayResults),
    [decayResults],
  );

  const decayedCount = useMemo(
    () => decayResults.filter((r) => r.suggestReassessment).length,
    [decayResults],
  );

  return {
    suggestReassessment: suggest,
    decayedSkillCount: decayedCount,
    daysSinceLastPractice: absent,
  };
}
