'use client';

import Link from 'next/link';
import type { ChatResponse } from '../../types/chat';

type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; payload?: ChatResponse };

type Props = {
  message: Message;
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap leading-6">{message.text}</p>

        {!isUser && message.payload?.references?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.payload.references.map((reference) =>
              reference.href ? (
                <Link
                  key={`${reference.type}-${reference.id ?? reference.label}`}
                  href={reference.href}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  {reference.label}
                </Link>
              ) : (
                <span
                  key={`${reference.type}-${reference.id ?? reference.label}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {reference.label}
                </span>
              )
            )}
          </div>
        ) : null}

        {!isUser && message.payload?.followUps?.length ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sugestões
            </p>
            <div className="flex flex-wrap gap-2">
              {message.payload.followUps.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
