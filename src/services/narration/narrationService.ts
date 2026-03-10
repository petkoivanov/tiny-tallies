/**
 * Narration service — reads problem text aloud using device TTS.
 *
 * Speech rate adjusts by child age:
 * - Age 6-7: 0.75x (slower for early readers)
 * - Age 7-8: 0.85x
 * - Age 8-9+: 0.95x
 *
 * Designed to be swappable to Gemini TTS later if native voice
 * quality is insufficient.
 */
import * as Speech from 'expo-speech';

/** Speech rate by age bracket (younger = slower) */
function speechRateForAge(age: number | null): number {
  if (age === null || age <= 7) return 0.75;
  if (age <= 8) return 0.85;
  return 0.95;
}

let currentUtteranceId = 0;

/**
 * Speak the given text aloud. Stops any currently playing narration first.
 * Returns a promise that resolves when speech finishes or is interrupted.
 */
export async function narrate(
  text: string,
  childAge: number | null,
): Promise<void> {
  // Stop any in-progress speech
  await stop();

  const id = ++currentUtteranceId;
  const rate = speechRateForAge(childAge);

  return new Promise<void>((resolve) => {
    Speech.speak(text, {
      language: 'en-US',
      rate,
      pitch: 1.0,
      onDone: () => {
        if (id === currentUtteranceId) resolve();
      },
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

/** Stop any currently playing narration. */
export async function stop(): Promise<void> {
  currentUtteranceId++;
  const speaking = await Speech.isSpeakingAsync();
  if (speaking) {
    Speech.stop();
  }
}

/** Check if narration is currently playing. */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
