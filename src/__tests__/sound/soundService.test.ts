/**
 * Tests for the sound service — audio playback, caching, and mute control.
 */

// Mock expo-av
const mockCreateAsync = jest.fn();
const mockSetAudioModeAsync = jest.fn();
const mockPlayAsync = jest.fn();
const mockSetPositionAsync = jest.fn();
const mockUnloadAsync = jest.fn();

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: (...args: unknown[]) => mockCreateAsync(...args),
    },
    setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
  },
}));

import {
  playSound,
  setSoundEnabled,
  isSoundEnabled,
  unloadAllSounds,
  playCorrect,
  playIncorrect,
} from '@/services/sound';

function createMockSound() {
  return {
    playAsync: mockPlayAsync,
    setPositionAsync: mockSetPositionAsync,
    unloadAsync: mockUnloadAsync,
  };
}

describe('soundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAudioModeAsync.mockResolvedValue(undefined);
    mockCreateAsync.mockResolvedValue({ sound: createMockSound() });
    mockPlayAsync.mockResolvedValue(undefined);
    mockSetPositionAsync.mockResolvedValue(undefined);
    mockUnloadAsync.mockResolvedValue(undefined);
    // Reset to default enabled state
    setSoundEnabled(true);
  });

  afterEach(async () => {
    // Clean up cached sounds between tests
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
      expect(mockCreateAsync).not.toHaveBeenCalled();
    });

    it('loads and plays a registered sound asset', async () => {
      await playSound('correct');
      expect(mockSetAudioModeAsync).toHaveBeenCalled();
      expect(mockCreateAsync).toHaveBeenCalledTimes(1);
      expect(mockSetPositionAsync).toHaveBeenCalledWith(0);
      expect(mockPlayAsync).toHaveBeenCalledTimes(1);
    });

    it('caches sound on second play (no duplicate createAsync)', async () => {
      await playSound('correct');
      await playSound('correct');
      expect(mockCreateAsync).toHaveBeenCalledTimes(1);
      expect(mockPlayAsync).toHaveBeenCalledTimes(2);
    });

    it('configures audio session only once', async () => {
      await playSound('correct');
      await playSound('incorrect');
      expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(1);
    });

    it('handles createAsync failure gracefully', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('load failed'));
      await expect(playSound('correct')).resolves.toBeUndefined();
    });

    it('handles playAsync failure gracefully', async () => {
      mockPlayAsync.mockRejectedValueOnce(new Error('play failed'));
      await expect(playSound('correct')).resolves.toBeUndefined();
    });
  });

  describe('convenience helpers', () => {
    it('playCorrect loads and plays correct sound', async () => {
      await playCorrect();
      expect(mockCreateAsync).toHaveBeenCalledTimes(1);
      expect(mockPlayAsync).toHaveBeenCalledTimes(1);
    });

    it('playIncorrect loads and plays incorrect sound', async () => {
      await playIncorrect();
      expect(mockCreateAsync).toHaveBeenCalledTimes(1);
      expect(mockPlayAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('unloadAllSounds', () => {
    it('unloads cached sounds', async () => {
      await playSound('correct');
      await unloadAllSounds();
      expect(mockUnloadAsync).toHaveBeenCalledTimes(1);
    });

    it('allows reload after unload', async () => {
      await playSound('correct');
      await unloadAllSounds();
      await playSound('correct');
      // Should create a new sound instance after cache was cleared
      expect(mockCreateAsync).toHaveBeenCalledTimes(2);
    });
  });
});
