import * as Haptics from 'expo-haptics';

/**
 * Trigger light impact haptic feedback on snap events.
 * Called via scheduleOnRN from worklet onEnd handlers.
 * This is a regular function (NOT a worklet).
 */
export function triggerSnapHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Trigger success notification haptic on group formation events.
 * Called via scheduleOnRN from worklet onEnd handlers.
 * This is a regular function (NOT a worklet).
 */
export function triggerGroupHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
