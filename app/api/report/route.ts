import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, type Content } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL } from '@/lib/gemini';
import { SCRIBE_SYSTEM_INSTRUCTION } from '@/lib/prompts';
import type { ChatMessage, Report } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Defensively pull a JSON object out of the model's reply, handling the case
 * where markdown code fences or stray prose slip through.
 */
function extractJson(raw: string): unknown {
  let s = (raw || '').trim();

  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) s = fence[1].trim();

  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end >= 0) s = s.slice(start, end + 1);

  return JSON.parse(s);
}

function buildReportFrom(raw: unknown): Report {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown): string =>
    typeof v === 'string' && v.trim() ? v.trim() : 'Not available.';

  return {
    recallClarity: str(obj.recallClarity),
    sentiment: str(obj.sentiment),
    engagementMetrics: str(obj.engagementMetrics),
    clinicalSummary: str(obj.clinicalSummary),
  };
}

/**
 * Medical Scribe endpoint — runs a hidden, separate Gemini call over the full
 * transcript and returns the structured clinical report.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { transcript?: ChatMessage[] };
    const transcript = body.transcript ?? [];

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No conversation transcript was provided.' },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    const transcriptText = transcript
      .map((m) => `${m.role === 'model' ? 'Therapist' : 'Patient'}: ${m.text}`)
      .join('\n');

    const contents: Content[] = [
      {
        role: 'user',
        parts: [
          {
            text: `Here is the full Reminiscence Therapy transcript:\n\n${transcriptText}\n\nPlease evaluate the patient and return the structured JSON.`,
          },
        ],
      },
    ];

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SCRIBE_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 800,
      },
    });

    const raw = response.text ?? '';
    const parsed = extractJson(raw);
    const report = buildReportFrom(parsed);

    return NextResponse.json(report);
  } catch (err) {
    console.error('[api/report] error:', err);

    const message =
      err instanceof Error
        ? err.message
        : 'Something went wrong while generating the report.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
