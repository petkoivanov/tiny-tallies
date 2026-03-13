import {
  getGeminiClient,
  resetGeminiClient,
  callGemini,
} from '../geminiClient';

// --- Mocks ---

const mockGenerateContent = jest.fn();
const mockGoogleGenAI = jest.fn().mockImplementation(() => ({
  models: { generateContent: mockGenerateContent },
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: (...args: unknown[]) => mockGoogleGenAI(...args),
}));

const mockGetItemAsync = jest.fn();
jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
}));

// --- Helpers ---

function setApiKey(key: string | null): void {
  mockGetItemAsync.mockResolvedValue(key);
}

function setGenerateContentResponse(
  text: string | undefined,
  overrides?: { candidates?: Array<{ finishReason?: string }> },
): void {
  mockGenerateContent.mockResolvedValue({ text, ...overrides });
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  resetGeminiClient();
  setApiKey('test-api-key-123');
  setGenerateContentResponse('Great job thinking about this!');
});

describe('getGeminiClient', () => {
  it('returns a client instance when API key exists in secure store', async () => {
    const client = await getGeminiClient();
    expect(client).toBeDefined();
    expect(client.models).toBeDefined();
    expect(mockGetItemAsync).toHaveBeenCalledWith('gemini-api-key');
  });

  it('throws descriptive error when API key not found', async () => {
    setApiKey(null);
    await expect(getGeminiClient()).rejects.toThrow(
      /API key not found/i,
    );
  });

  it('returns cached instance on second call (lazy singleton)', async () => {
    const first = await getGeminiClient();
    const second = await getGeminiClient();
    expect(first).toBe(second);
    // SecureStore should only be called once
    expect(mockGetItemAsync).toHaveBeenCalledTimes(1);
  });

  it('re-initializes after resetGeminiClient', async () => {
    const first = await getGeminiClient();
    resetGeminiClient();
    const second = await getGeminiClient();
    // Both are new objects from the mock, but SecureStore called twice
    expect(mockGetItemAsync).toHaveBeenCalledTimes(2);
    expect(first).not.toBe(second);
  });
});

describe('callGemini', () => {
  it('calls models.generateContent with correct model, systemInstruction, temperature, maxOutputTokens', async () => {
    await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'What is 3 + 4?',
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArg = mockGenerateContent.mock.calls[0][0];
    expect(callArg.model).toBe('gemini-2.5-flash');
    expect(callArg.config.systemInstruction).toBe('Be helpful');
    expect(callArg.config.temperature).toBe(0.7);
    expect(callArg.config.maxOutputTokens).toBe(8192);
    expect(callArg.contents).toBe('What is 3 + 4?');
  });

  it('returns validated text from response', async () => {
    setGenerateContentResponse('Try counting on your fingers!');
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBe('Try counting on your fingers!');
  });

  it('returns null on empty response text (safety block fallback)', async () => {
    setGenerateContentResponse('');
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBeNull();
  });

  it('returns null on undefined response text (safety block fallback)', async () => {
    setGenerateContentResponse(undefined);
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBeNull();
  });

  it('returns null when finishReason is SAFETY', async () => {
    setGenerateContentResponse('blocked content', {
      candidates: [{ finishReason: 'SAFETY' }],
    });
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBeNull();
  });

  it('returns null when finishReason is RECITATION', async () => {
    setGenerateContentResponse('recited content', {
      candidates: [{ finishReason: 'RECITATION' }],
    });
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBeNull();
  });

  it('returns text normally when finishReason is STOP', async () => {
    setGenerateContentResponse('Good thinking!', {
      candidates: [{ finishReason: 'STOP' }],
    });
    const result = await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });
    expect(result).toBe('Good thinking!');
  });

  it('passes safetySettings in config to generateContent', async () => {
    await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'What is 3 + 4?',
    });

    const callArg = mockGenerateContent.mock.calls[0][0];
    expect(callArg.config.safetySettings).toBeDefined();
    expect(callArg.config.safetySettings).toHaveLength(4);
    // Verify all 4 harm categories are present
    const categories = callArg.config.safetySettings.map(
      (s: { category: string }) => s.category,
    );
    expect(categories).toContain('HARM_CATEGORY_HARASSMENT');
    expect(categories).toContain('HARM_CATEGORY_HATE_SPEECH');
    expect(categories).toContain('HARM_CATEGORY_SEXUALLY_EXPLICIT');
    expect(categories).toContain('HARM_CATEGORY_DANGEROUS_CONTENT');
    // All set to BLOCK_LOW_AND_ABOVE
    for (const setting of callArg.config.safetySettings) {
      expect(setting.threshold).toBe('BLOCK_LOW_AND_ABOVE');
    }
  });

  it('aborts when external abortSignal fires', async () => {
    const controller = new AbortController();
    // Make generateContent hang indefinitely until aborted
    mockGenerateContent.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          const checkAbort = setInterval(() => {
            if (controller.signal.aborted) {
              clearInterval(checkAbort);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            }
          }, 10);
        }),
    );

    const promise = callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
      abortSignal: controller.signal,
    });

    // Abort externally
    controller.abort();

    await expect(promise).rejects.toThrow();
  });

  it('passes an AbortSignal via httpOptions to generateContent', async () => {
    // Verify that callGemini wires up an AbortSignal for timeout control.
    // We capture the httpOptions.signal from the mock call.
    let capturedSignal: AbortSignal | undefined;

    mockGenerateContent.mockImplementation(
      (opts: { httpOptions?: { signal?: AbortSignal } }) => {
        capturedSignal = opts?.httpOptions?.signal;
        // Resolve immediately so the test doesn't hang
        return Promise.resolve({ text: 'Hello!' });
      },
    );

    await callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    });

    // Verify a signal was passed (for timeout abort capability)
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
    // Signal should NOT be aborted yet (response came back before timeout)
    expect(capturedSignal!.aborted).toBe(false);
  });

  it('creates a timeout that fires after 8 seconds', async () => {
    // Use fake timers to verify the 8-second timeout constant.
    // Pre-warm the client so getGeminiClient resolves synchronously from cache.
    await getGeminiClient();

    jest.useFakeTimers();

    let signalAborted = false;
    mockGenerateContent.mockImplementation(
      (opts: { httpOptions?: { signal?: AbortSignal } }) => {
        const signal = opts?.httpOptions?.signal;
        return new Promise((_resolve, reject) => {
          if (signal?.aborted) {
            signalAborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          signal?.addEventListener('abort', () => {
            signalAborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      },
    );

    // Capture rejection so it doesn't become unhandled
    let rejectedError: Error | null = null;
    const promise = callGemini({
      systemInstruction: 'Be helpful',
      userMessage: 'Help me',
    }).catch((e) => {
      rejectedError = e;
    });

    // Flush microtasks so the async getGeminiClient() resolves
    // and generateContent mock is called
    await jest.advanceTimersByTimeAsync(100);

    // Before 8s: signal should not be aborted
    expect(signalAborted).toBe(false);
    expect(rejectedError).toBeNull();

    // Advance to just past 8s
    await jest.advanceTimersByTimeAsync(8000);

    // Now the timeout should have fired, aborting the signal
    expect(signalAborted).toBe(true);

    // Wait for the promise to settle
    await promise;

    // The promise should have rejected due to abort
    expect(rejectedError).not.toBeNull();
    expect(rejectedError!.name).toBe('AbortError');

    jest.useRealTimers();
  });

  it('handles already-aborted signal immediately', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      callGemini({
        systemInstruction: 'Be helpful',
        userMessage: 'Help me',
        abortSignal: controller.signal,
      }),
    ).rejects.toThrow();
  });
});
