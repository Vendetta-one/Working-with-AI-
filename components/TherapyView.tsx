'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Square, AlertCircle } from 'lucide-react';
import ChatBubble from './ChatBubble';
import Spinner from './Spinner';
import type { ChatMessage, ImageData } from '@/lib/types';

interface TherapyViewProps {
  image: ImageData;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onEnd: () => void;
  isResponding: boolean;
  isGeneratingReport: boolean;
  error: string | null;
}

export default function TherapyView({
  image,
  messages,
  onSend,
  onEnd,
  isResponding,
  isGeneratingReport,
  error,
}: TherapyViewProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || isResponding || isGeneratingReport) return;
    setText('');
    onSend(trimmed);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  const inputLocked = isResponding || isGeneratingReport;

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-2xl flex-col px-4 py-4">
      {/* Pinned session photo */}
      <div className="mb-3 flex items-center gap-3 rounded-3xl border border-paleblue-200 bg-white/70 p-3 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.dataUrl}
          alt={`Uploaded photo: ${image.name}`}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-wide text-ink/50">Session photo</p>
          <p className="truncate text-lg text-ink">{image.name}</p>
        </div>
      </div>

      {/* Conversation */}
      <div
        className="flex-1 space-y-5 overflow-y-auto rounded-3xl bg-white/40 p-4"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}

        {isResponding ? (
          <div className="flex items-center gap-3 text-ink/60">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft"
              aria-hidden="true"
            >
              <span className="text-xl">●</span>
            </div>
            <div className="rounded-3xl rounded-bl-md border border-paleblue-200 bg-white px-5 py-4">
              <Spinner label="The therapist is listening…" />
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-base text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Reply input */}
      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Share a memory or reply…"
          disabled={inputLocked}
          className="max-h-40 flex-1 resize-none rounded-2xl border border-paleblue-200 bg-white px-4 py-3 text-lg text-ink shadow-sm focus:border-sage-600"
        />
        <button
          type="submit"
          disabled={inputLocked || !text.trim()}
          aria-label="Send message"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-soft transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-6 w-6" aria-hidden="true" />
        </button>
      </form>

      {/* Prominent, red End Session button */}
      <button
        type="button"
        onClick={onEnd}
        disabled={inputLocked}
        className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-xl font-semibold text-white shadow-soft transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Square className="h-6 w-6 fill-current" aria-hidden="true" />
        End Session &amp; Generate Report
      </button>

      {/* Full-screen report-generation overlay */}
      {isGeneratingReport ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-warmwhite/90 px-6 text-center backdrop-blur-sm"
          role="status"
          aria-live="assertive"
        >
          <Spinner label="Creating the medical summary for the doctor…" />
        </div>
      ) : null}
    </div>
  );
}
