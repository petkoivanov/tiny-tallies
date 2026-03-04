import { GoogleGenAI } from '@google/genai';
import * as SecureStore from 'expo-secure-store';
import { geminiResponseSchema } from './types';

const GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 8000;
const API_KEY_STORE_KEY = 'gemini-api-key';

let clientInstance: GoogleGenAI | null = null;

/**
 * Lazily initializes and caches a GoogleGenAI client.
 * Reads the API key from expo-secure-store on first call.
 * Throws a descriptive error if no API key is found.
 */
export async function getGeminiClient(): Promise<GoogleGenAI> {
  if (clientInstance) return clientInstance;

  const apiKey = await SecureStore.getItemAsync(API_KEY_STORE_KEY);
  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. Please add your API key in Settings.',
    );
  }

  clientInstance = new GoogleGenAI({ apiKey });
  return clientInstance;
}

/**
 * Clears the cached client instance.
 * Used for testing and API key rotation.
 */
export function resetGeminiClient(): void {
  clientInstance = null;
}

export interface CallGeminiOptions {
  systemInstruction: string;
  userMessage: string;
  abortSignal?: AbortSignal;
}

/**
 * Calls the Gemini API with system instruction and user message.
 * Implements an 8-second timeout and supports external abort signals.
 * Validates response with Zod schema.
 */
export async function callGemini(options: CallGeminiOptions): Promise<string> {
  const client = await getGeminiClient();

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  // Combine external signal with timeout signal
  let combinedSignal: AbortSignal = timeoutController.signal;
  let externalListener: (() => void) | null = null;

  if (options.abortSignal) {
    if (options.abortSignal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    // Use AbortSignal.any if available, otherwise manual forwarding
    if (typeof AbortSignal.any === 'function') {
      combinedSignal = AbortSignal.any([
        options.abortSignal,
        timeoutController.signal,
      ]);
    } else {
      externalListener = () => timeoutController.abort();
      options.abortSignal.addEventListener('abort', externalListener);
    }
  }

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: options.userMessage,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
      },
      // @ts-expect-error -- httpOptions.signal is supported at runtime
      httpOptions: { signal: combinedSignal },
    });

    const text = response.text ?? '';
    const parsed = geminiResponseSchema.parse({ text });
    return parsed.text;
  } finally {
    clearTimeout(timeoutId);
    if (externalListener && options.abortSignal) {
      options.abortSignal.removeEventListener('abort', externalListener);
    }
  }
}
