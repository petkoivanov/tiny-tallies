/**
 * useTimeControls — checks parental time limits before and during sessions.
 *
 * Provides:
 * - canStartSession(): whether the child is allowed to start a new session
 * - blockReason: human-readable reason if blocked
 * - todayMinutesUsed: total practice minutes today
 * - dailyLimitMinutes: configured limit (0 = unlimited)
 * - shouldShowBreakReminder(sessionElapsedMs): whether to show a break popup
 */

import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import type { SessionHistoryEntry } from '@/store/slices/sessionHistorySlice';
import type { BedtimeWindow } from '@/store/slices/childProfileSlice';

export type BlockReason = 'daily_limit' | 'bedtime' | null;

export interface TimeControlsResult {
  canStartSession: boolean;
  blockReason: BlockReason;
  blockMessage: string | null;
  todayMinutesUsed: number;
  dailyMinutesRemaining: number | null;
  dailyLimitMinutes: number;
  breakReminderMinutes: number;
}

/** Get total practice minutes for today from session history. */
export function getTodayMinutes(
  history: SessionHistoryEntry[],
  now: Date = new Date(),
): number {
  const todayStr = now.toISOString().slice(0, 10);
  let totalMs = 0;
  for (const entry of history) {
    if (entry.completedAt.slice(0, 10) === todayStr) {
      totalMs += entry.durationMs;
    }
  }
  return Math.floor(totalMs / 60_000);
}

/** Check if current time falls within a bedtime window. */
export function isInBedtime(
  window: BedtimeWindow | null,
  now: Date = new Date(),
): boolean {
  if (!window) return false;

  const [startH, startM] = window.start.split(':').map(Number);
  const [endH, endM] = window.end.split(':').map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Same-day window (e.g. 13:00 - 15:00)
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // Overnight window (e.g. 20:00 - 07:00)
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

/** Check if a break reminder should fire based on elapsed session time. */
export function shouldShowBreak(
  breakReminderMinutes: number,
  sessionElapsedMs: number,
): boolean {
  if (breakReminderMinutes <= 0) return false;
  const elapsedMin = sessionElapsedMs / 60_000;
  // Fire at each interval (e.g. every 15 min)
  const intervals = Math.floor(elapsedMin / breakReminderMinutes);
  const prevIntervals = Math.floor(
    (elapsedMin - 1 / 60) / breakReminderMinutes,
  );
  return intervals > prevIntervals && intervals > 0;
}

export function useTimeControls(): TimeControlsResult {
  const dailyLimitMinutes = useAppStore((s) => s.dailyLimitMinutes);
  const bedtimeWindow = useAppStore((s) => s.bedtimeWindow);
  const breakReminderMinutes = useAppStore((s) => s.breakReminderMinutes);
  const sessionHistory = useAppStore((s) => s.sessionHistory);

  return useMemo(() => {
    const now = new Date();
    const todayMinutesUsed = getTodayMinutes(sessionHistory, now);

    // Check bedtime first (higher priority)
    if (isInBedtime(bedtimeWindow, now)) {
      return {
        canStartSession: false,
        blockReason: 'bedtime' as BlockReason,
        blockMessage: 'It\'s bedtime! Come back tomorrow to practice.',
        todayMinutesUsed,
        dailyMinutesRemaining: null,
        dailyLimitMinutes,
        breakReminderMinutes,
      };
    }

    // Check daily limit
    if (dailyLimitMinutes > 0 && todayMinutesUsed >= dailyLimitMinutes) {
      return {
        canStartSession: false,
        blockReason: 'daily_limit' as BlockReason,
        blockMessage: `You've practiced ${todayMinutesUsed} minutes today. Great job! Come back tomorrow.`,
        todayMinutesUsed,
        dailyMinutesRemaining: 0,
        dailyLimitMinutes,
        breakReminderMinutes,
      };
    }

    const dailyMinutesRemaining =
      dailyLimitMinutes > 0 ? dailyLimitMinutes - todayMinutesUsed : null;

    return {
      canStartSession: true,
      blockReason: null,
      blockMessage: null,
      todayMinutesUsed,
      dailyMinutesRemaining,
      dailyLimitMinutes,
      breakReminderMinutes,
    };
  }, [dailyLimitMinutes, bedtimeWindow, breakReminderMinutes, sessionHistory]);
}
