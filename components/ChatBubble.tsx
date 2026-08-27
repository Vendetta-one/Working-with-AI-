'use client';

import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full items-end gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-float-in`}
    >
      {!isUser && (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft"
          aria-hidden="true"
        >
          <Bot className="h-6 w-6" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-3xl px-5 py-4 text-lg leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-md bg-sage-600 text-white'
            : 'rounded-bl-md border border-paleblue-200 bg-white text-ink'
        }`}
      >
        {message.text}
      </div>

      {isUser && (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paleblue-700 text-white shadow-soft"
          aria-hidden="true"
        >
          <User className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
