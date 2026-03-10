/**
 * Sound service — manages audio playback for feedback sounds.
 *
 * Uses expo-av for audio. Sounds are loaded lazily on first play,
 * then cached for instant replay. Respects the soundEnabled store
 * preference. Gracefully no-ops if sound files are missing.
 *
 * All SFX should be <500ms duration per UX spec.
 */

import { Audio, type AVPlaybackSource } from 'expo-av';
import type { SoundEffect } from './soundTypes';

/**
 * Map each sound effect to its audio asset.
 * require() calls must be static literals for Metro bundler.
 */
const SOUND_ASSETS: Record<SoundEffect, AVPlaybackSource> = {
  correct: require('../../../assets/sounds/correct.mp3'),
  incorrect: require('../../../assets/sounds/incorrect.mp3'),
  levelUp: require('../../../assets/sounds/levelUp.mp3'),
  celebration: require('../../../assets/sounds/celebration.mp3'),
  buttonTap: require('../../../assets/sounds/buttonTap.mp3'),
  sessionComplete: require('../../../assets/sounds/sessionComplete.mp3'),
};

/** Cached Audio.Sound instances keyed by effect name */
const soundCache = new Map<SoundEffect, Audio.Sound>();

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
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioConfigured = true;
  } catch {
    // Audio configuration failed — sounds will be silent
  }
}

/**
 * Load and cache a sound effect. Returns null if asset is missing.
 */
async function getSound(effect: SoundEffect): Promise<Audio.Sound | null> {
  const cached = soundCache.get(effect);
  if (cached) return cached;

  const asset = SOUND_ASSETS[effect];
  if (!asset) return null;

  try {
    const { sound } = await Audio.Sound.createAsync(asset, {
      shouldPlay: false,
      volume: 1.0,
    });
    soundCache.set(effect, sound);
    return sound;
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
  const sound = await getSound(effect);
  if (!sound) return;

  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
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
 * Unload all cached sounds. Call on app background or cleanup.
 */
export async function unloadAllSounds(): Promise<void> {
  const entries = [...soundCache.values()];
  soundCache.clear();
  for (const sound of entries) {
    try {
      await sound.unloadAsync();
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
