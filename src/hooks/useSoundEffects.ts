/**
 * useSoundEffects — syncs store sound preference and plays feedback sounds.
 *
 * Watches feedbackState from useSession and plays correct/incorrect sounds.
 * Also keeps the soundService in sync with the store's soundEnabled flag.
 */

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  setSoundEnabled,
  playCorrect,
  playIncorrect,
  playSessionComplete,
} from '@/services/sound';
import type { FeedbackState } from './useSession';

/**
 * Sync sound preference from store to service.
 * Call once near the app root (e.g., in SessionScreen or App).
 */
export function useSoundSync(): void {
  const soundEnabled = useAppStore((s) => s.soundEnabled);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);
}

/**
 * Play sounds in response to session feedback state changes.
 */
export function useSessionSounds(
  feedbackState: FeedbackState | null,
  isComplete: boolean,
): void {
  // Play correct/incorrect on feedback
  useEffect(() => {
    if (!feedbackState?.visible) return;
    if (feedbackState.correct) {
      playCorrect();
    } else {
      playIncorrect();
    }
  }, [feedbackState]);

  // Play session complete sound
  useEffect(() => {
    if (isComplete) {
      playSessionComplete();
    }
  }, [isComplete]);
}
