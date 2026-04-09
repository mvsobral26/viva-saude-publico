'use client';

import type { ChatContext } from '../../types/chat';

type Props = {
  context?: ChatContext;
  onSelect: (question: string) => void;
};

function getQuickActions(context?: ChatContext) {
  switch (context?.screen) {
    case 'beneficiario_detalhe':
    case 'beneficiario_score':
    case 'beneficiario_plano':
      return [
        'Resuma este beneficiário',
        'Explique o score deste beneficiário',
        'Quais alertas este beneficiário possui?',
      ];
    case 'eficiencia':
    case 'eficiencia_detalhe':
      return [
        'Quais têm exame com possível redundância?',
        'Quais têm repetição assistencial?',
        'Quais são os casos mais críticos?',
      ];
    case 'alertas':
      return [
        'Quais são os casos mais críticos?',
        'Quem está sem acompanhamento?',
        'Explique o score deste beneficiário',
      ];
    case 'beneficiarios':
      return [
        'Quais são os casos mais críticos?',
        'Quem está sem acompanhamento?',
        'Resuma esta área',
      ];
    case 'dashboard':
    default:
      return [
        'Quais são os casos mais críticos?',
        'Quem está sem acompanhamento?',
        'Quais têm exame com possível redundância?',
      ];
  }
}

export default function ChatQuickActions({ context, onSelect }: Props) {
  const actions = getQuickActions(context);

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Perguntas rápidas
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onSelect(action)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
