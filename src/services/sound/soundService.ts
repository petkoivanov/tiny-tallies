/**
 * Sound service — manages audio playback for feedback sounds.
 *
 * Uses expo-audio for audio. Sounds are created lazily on first play,
 * then cached for instant replay. Respects the soundEnabled store
 * preference. Gracefully no-ops if sound files are missing.
 *
 * All SFX should be <500ms duration per UX spec.
 */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioSource } from 'expo-audio';
import type { SoundEffect } from './soundTypes';

/**
 * Map each sound effect to its audio asset.
 * require() calls must be static literals for Metro bundler.
 */
const SOUND_ASSETS: Record<SoundEffect, AudioSource> = {
  correct: require('../../../assets/sounds/correct.mp3'),
  incorrect: require('../../../assets/sounds/incorrect.mp3'),
  levelUp: require('../../../assets/sounds/levelUp.mp3'),
  celebration: require('../../../assets/sounds/celebration.mp3'),
  buttonTap: require('../../../assets/sounds/buttonTap.mp3'),
  sessionComplete: require('../../../assets/sounds/sessionComplete.mp3'),
};

/** Cached AudioPlayer instances keyed by effect name */
const playerCache = new Map<SoundEffect, AudioPlayer>();

/** Whether sound is globally enabled (synced from store) */
let enabled = true;

/** Whether the audio session has been configured */
let audioConfigured = false;

/**
 * Configure the audio session for playback.
 * Called once before first sound plays.
 */
async function ensureAudioConfigured(): Promise<void> {
  if (audioConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    });
    audioConfigured = true;
  } catch {
    // Audio configuration failed — sounds will be silent
  }
}

/**
 * Get or create a cached player for a sound effect. Returns null if asset is missing.
 */
function getPlayer(effect: SoundEffect): AudioPlayer | null {
  const cached = playerCache.get(effect);
  if (cached) return cached;

  const asset = SOUND_ASSETS[effect];
  if (asset == null) return null;

  try {
    const player = createAudioPlayer(asset);
    player.volume = 1.0;
    playerCache.set(effect, player);
    return player;
  } catch {
    return null;
  }
}

/**
 * Play a sound effect. No-ops if sound is disabled or asset is missing.
 */
export async function playSound(effect: SoundEffect): Promise<void> {
  if (!enabled) return;

  await ensureAudioConfigured();
  const player = getPlayer(effect);
  if (!player) return;

  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // Playback failed — silent degradation
  }
}

/**
 * Set whether sounds are enabled. Called from store subscription.
 */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

/**
 * Get current sound enabled state.
 */
export function isSoundEnabled(): boolean {
  return enabled;
}

/**
 * Remove all cached players. Call on app background or cleanup.
 */
export async function unloadAllSounds(): Promise<void> {
  const entries = [...playerCache.values()];
  playerCache.clear();
  for (const player of entries) {
    try {
      player.remove();
    } catch {
      // Ignore cleanup errors
    }
  }
  audioConfigured = false;
}

/**
 * Convenience helpers for common sound effects.
 */
export const playCorrect = () => playSound('correct');
export const playIncorrect = () => playSound('incorrect');
export const playLevelUp = () => playSound('levelUp');
export const playCelebration = () => playSound('celebration');
export const playButtonTap = () => playSound('buttonTap');
export const playSessionComplete = () => playSound('sessionComplete');
