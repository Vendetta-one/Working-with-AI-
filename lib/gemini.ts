import { GoogleGenAI } from '@google/genai';

/**
 * The multimodal model used across the app.
 */
export const GEMINI_MODEL = 'gemini-2.5-flash';

let cachedClient: GoogleGenAI | null = null;

/**
 * Returns a lazily-created, cached Gemini client.
 *
 * The key is read from NEXT_PUBLIC_GEMINI_API_KEY, as requested in the spec.
 * The API calls themselves happen inside server-side route handlers, so the
 * key is only used on the server at request time (not bundled into the
 * browser). For a production deployment you may want to switch to a
 * server-only variable (without the NEXT_PUBLIC_ prefix).
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing Gemini API key. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file (see .env.example).'
    );
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }

  return cachedClient;
}
