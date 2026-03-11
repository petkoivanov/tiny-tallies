/**
 * Tests for the sound service — audio playback, caching, and mute control.
 */

// Mock expo-audio
const mockCreateAudioPlayer = jest.fn();
const mockSetAudioModeAsync = jest.fn();
const mockPlay = jest.fn();
const mockSeekTo = jest.fn();
const mockRemove = jest.fn();

jest.mock('expo-audio', () => ({
  createAudioPlayer: (...args: unknown[]) => mockCreateAudioPlayer(...args),
  setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
}));

import {
  playSound,
  setSoundEnabled,
  isSoundEnabled,
  unloadAllSounds,
  playCorrect,
  playIncorrect,
} from '@/services/sound';

function createMockPlayer() {
  return {
    play: mockPlay,
    seekTo: mockSeekTo,
    remove: mockRemove,
    volume: 1.0,
  };
}

describe('soundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAudioModeAsync.mockResolvedValue(undefined);
    mockCreateAudioPlayer.mockReturnValue(createMockPlayer());
    mockPlay.mockReturnValue(undefined);
    mockSeekTo.mockResolvedValue(undefined);
    mockRemove.mockReturnValue(undefined);
    // Reset to default enabled state
    setSoundEnabled(true);
  });

  afterEach(async () => {
    // Clean up cached players between tests
    await unloadAllSounds();
  });

  describe('setSoundEnabled / isSoundEnabled', () => {
    it('defaults to enabled', () => {
      expect(isSoundEnabled()).toBe(true);
    });

    it('can be disabled', () => {
      setSoundEnabled(false);
      expect(isSoundEnabled()).toBe(false);
    });

    it('can be re-enabled', () => {
      setSoundEnabled(false);
      setSoundEnabled(true);
      expect(isSoundEnabled()).toBe(true);
    });
  });

  describe('playSound', () => {
    it('no-ops when sound is disabled', async () => {
      setSoundEnabled(false);
      await playSound('correct');
      expect(mockSetAudioModeAsync).not.toHaveBeenCalled();
      expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    });

    it('creates player and plays a registered sound asset', async () => {
      await playSound('correct');
      expect(mockSetAudioModeAsync).toHaveBeenCalled();
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
      expect(mockSeekTo).toHaveBeenCalledWith(0);
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('caches player on second play (no duplicate createAudioPlayer)', async () => {
      await playSound('correct');
      await playSound('correct');
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
      expect(mockPlay).toHaveBeenCalledTimes(2);
    });

    it('configures audio session only once', async () => {
      await playSound('correct');
      await playSound('incorrect');
      expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(1);
    });

    it('handles createAudioPlayer failure gracefully', async () => {
      mockCreateAudioPlayer.mockImplementationOnce(() => {
        throw new Error('create failed');
      });
      await expect(playSound('correct')).resolves.toBeUndefined();
    });

    it('handles play failure gracefully', async () => {
      mockSeekTo.mockRejectedValueOnce(new Error('seek failed'));
      await expect(playSound('correct')).resolves.toBeUndefined();
    });
  });

  describe('convenience helpers', () => {
    it('playCorrect creates and plays correct sound', async () => {
      await playCorrect();
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('playIncorrect creates and plays incorrect sound', async () => {
      await playIncorrect();
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('unloadAllSounds', () => {
    it('removes cached players', async () => {
      await playSound('correct');
      await unloadAllSounds();
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });

    it('allows reload after unload', async () => {
      await playSound('correct');
      await unloadAllSounds();
      await playSound('correct');
      // Should create a new player instance after cache was cleared
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(2);
    });
  });
});
