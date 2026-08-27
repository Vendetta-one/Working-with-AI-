'use client';

import { useState } from 'react';
import UploadView from '@/components/UploadView';
import TherapyView from '@/components/TherapyView';
import ReportView from '@/components/ReportView';
import { STARTING_PROMPT } from '@/lib/prompts';
import type { AppState, ChatMessage, ImageData, Report } from '@/lib/types';

export default function Home() {
  // ---- State machine: upload -> therapy -> report -------------------------
  const [state, setState] = useState<AppState>('upload');
  const [image, setImage] = useState<ImageData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  const [isResponding, setIsResponding] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Calls the Therapist endpoint and returns the model's reply text. */
  const callChat = async (body: {
    messages: ChatMessage[];
    image?: ImageData | null;
  }): Promise<string> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: body.messages,
        ...(body.image ? { image: body.image } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'The therapist could not respond right now.');
    }
    return data.text as string;
  };

  /** Upload state -> kick off the session with the photo. */
  const handleImageSelected = async (img: ImageData) => {
    setError(null);
    setIsResponding(true);
    setImage(img);
    try {
      const firstReply = await callChat({
        messages: [{ role: 'user', text: STARTING_PROMPT }],
        image: img,
      });
      setMessages([{ role: 'model', text: firstReply }]);
      setState('therapy');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong starting the session.');
    } finally {
      setIsResponding(false);
    }
  };

  /** Therapy state -> send a patient message, append the therapist reply. */
  const handleSend = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setError(null);
    setIsResponding(true);
    try {
      const reply = await callChat({ messages: next });
      setMessages([...next, { role: 'model', text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try sending again.');
    } finally {
      setIsResponding(false);
    }
  };

  /** End Session -> run the hidden Scribe call and move to the report. */
  const handleEnd = async () => {
    setError(null);
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'We could not create the report.');
      }
      setReport(data as Report);
      setState('report');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not create the report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  /** Report state -> reset everything for a fresh session. */
  const handleReset = () => {
    setState('upload');
    setImage(null);
    setMessages([]);
    setReport(null);
    setError(null);
  };

  return (
    <main className="min-h-[100dvh] w-full">
      {state === 'upload' && (
        <UploadView
          onImageSelected={handleImageSelected}
          isBusy={isResponding}
          error={error}
        />
      )}

      {state === 'therapy' && image && (
        <TherapyView
          image={image}
          messages={messages}
          onSend={handleSend}
          onEnd={handleEnd}
          isResponding={isResponding}
          isGeneratingReport={isGeneratingReport}
          error={error}
        />
      )}

      {state === 'report' && <ReportView report={report} onReset={handleReset} />}
    </main>
  );
}
