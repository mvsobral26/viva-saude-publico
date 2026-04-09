'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ChatContext, ChatRequest, ChatResponse } from '../../types/chat';
import ChatContextChips from './ChatContextChips';
import ChatMessage from './ChatMessage';
import ChatQuickActions from './ChatQuickActions';

type UserMessage = {
  id: string;
  role: 'user';
  text: string;
};

type AssistantMessage = {
  id: string;
  role: 'assistant';
  text: string;
  payload?: ChatResponse;
};

type Message = UserMessage | AssistantMessage;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  context?: ChatContext;
};

export default function ChatPanel({ isOpen, onClose, context }: Props) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá. Posso explicar score, alertas, criticidade e oportunidades de eficiência do Viva+.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, mounted]);

  const placeholder = useMemo(() => {
    if (context?.beneficiaryId) return 'Pergunte sobre este beneficiário...';
    if (context?.screen === 'eficiencia' || context?.screen === 'eficiencia_detalhe') {
      return 'Pergunte sobre eficiência assistencial...';
    }
    return 'Pergunte sobre o Viva+...';
  }, [context]);

  async function submitQuestion(question: string) {
    const text = question.trim();
    if (!text || loading) return;

    const userMessage: UserMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload: ChatRequest = {
        message: text,
        context,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ChatResponse;

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: data.answer,
          payload: data,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          text: 'Não consegui responder agora. Verifique a rota do chat e tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !isOpen) return null;

  const panel = (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar assistente"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.45)',
          border: 'none',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      />

      <aside
        id="assistente-viva-panel"
        aria-modal="true"
        role="dialog"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '460px',
          maxWidth: '100vw',
          height: '100vh',
          background: '#f8fafc',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assistente Viva+</h2>
            <p className="text-xs text-slate-500">Leitura analítica do ecossistema Viva+</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        <ChatContextChips context={context} />

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Consultando regras e dados do Viva+...
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200 bg-white">
          <ChatQuickActions context={context} onSelect={submitQuestion} />
          <form
            className="border-t border-slate-200 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitQuestion(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              placeholder={placeholder}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Escopo seguro: score, alertas, criticidade e eficiência.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );

  return createPortal(panel, document.body);
}
