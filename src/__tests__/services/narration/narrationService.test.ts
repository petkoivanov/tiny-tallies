import * as Speech from 'expo-speech';

import { narrate, stop, isSpeaking } from '@/services/narration';

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

const mockSpeak = Speech.speak as jest.MockedFunction<typeof Speech.speak>;
const mockStop = Speech.stop as jest.MockedFunction<typeof Speech.stop>;
const mockIsSpeaking = Speech.isSpeakingAsync as jest.MockedFunction<
  typeof Speech.isSpeakingAsync
>;

describe('narrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSpeaking.mockResolvedValue(false);
  });

  describe('narrate', () => {
    it('calls Speech.speak with the given text', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        options?.onDone?.();
      });

      await narrate('Hello world', null);

      expect(mockSpeak).toHaveBeenCalledWith(
        'Hello world',
        expect.objectContaining({
          language: 'en-US',
          pitch: 1.0,
        }),
      );
    });

    it('uses slow rate (0.75) for age 6-7 or null', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        options?.onDone?.();
      });

      await narrate('test', null);
      expect(mockSpeak).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ rate: 0.75 }),
      );

      await narrate('test', 6);
      expect(mockSpeak).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ rate: 0.75 }),
      );

      await narrate('test', 7);
      expect(mockSpeak).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ rate: 0.75 }),
      );
    });

    it('uses medium rate (0.85) for age 8', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        options?.onDone?.();
      });

      await narrate('test', 8);
      expect(mockSpeak).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ rate: 0.85 }),
      );
    });

    it('uses faster rate (0.95) for age 9+', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        options?.onDone?.();
      });

      await narrate('test', 9);
      expect(mockSpeak).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ rate: 0.95 }),
      );
    });

    it('stops existing speech before starting new narration', async () => {
      mockIsSpeaking.mockResolvedValue(true);
      mockSpeak.mockImplementation((_text, options) => {
        options?.onDone?.();
      });

      await narrate('new text', null);

      expect(mockStop).toHaveBeenCalled();
    });

    it('resolves when speech completes via onDone', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        setTimeout(() => options?.onDone?.(), 10);
      });

      const result = narrate('test', null);
      await expect(result).resolves.toBeUndefined();
    });

    it('resolves when speech is stopped via onStopped', async () => {
      mockSpeak.mockImplementation((_text, options) => {
        setTimeout(() => options?.onStopped?.(), 10);
      });

      const result = narrate('test', null);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('stop', () => {
    it('calls Speech.stop when speaking', async () => {
      mockIsSpeaking.mockResolvedValue(true);
      await stop();
      expect(mockStop).toHaveBeenCalled();
    });

    it('does not call Speech.stop when not speaking', async () => {
      mockIsSpeaking.mockResolvedValue(false);
      await stop();
      expect(mockStop).not.toHaveBeenCalled();
    });
  });

  describe('isSpeaking', () => {
    it('delegates to Speech.isSpeakingAsync', async () => {
      mockIsSpeaking.mockResolvedValue(true);
      const result = await isSpeaking();
      expect(result).toBe(true);
    });
  });
});
