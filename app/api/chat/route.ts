import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, type Content, type Part } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL } from '@/lib/gemini';
import { THERAPIST_SYSTEM_INSTRUCTION } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  messages?: { role: 'user' | 'model'; text: string }[];
  image?: { mimeType?: string; data?: string } | null;
}

/**
 * Therapist endpoint — drives the real-time reminiscence conversation.
 * Accepts the running transcript plus (on the first call) the uploaded photo,
 * and returns the therapist's next single response.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const incoming = body.messages ?? [];

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json(
        { error: 'No messages were provided for the therapist.' },
        { status: 400 }
      );
    }

    const client: GoogleGenAI = getGeminiClient();

    const contents: Content[] = incoming.map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text ?? '' }],
    }));

    // Attach the photograph to the first user turn so the model can "see" it.
    if (body.image?.data) {
      const imagePart: Part = {
        inlineData: {
          mimeType: body.image.mimeType || 'image/jpeg',
          data: body.image.data,
        },
      };

      const firstUserIndex = contents.findIndex((c) => c.role === 'user');
      if (firstUserIndex >= 0) {
        const existing = contents[firstUserIndex].parts ?? [];
        contents[firstUserIndex] = {
          ...contents[firstUserIndex],
          parts: [imagePart, ...existing],
        };
      } else {
        contents.unshift({ role: 'user', parts: [imagePart] });
      }
    }

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: THERAPIST_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 256,
      },
    });

    const text = (response.text ?? '').trim();

    if (!text) {
      return NextResponse.json(
        { error: 'The therapist did not return a response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error('[api/chat] error:', err);

    const message =
      err instanceof Error
        ? err.message
        : 'Something went wrong while talking to the therapist.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
