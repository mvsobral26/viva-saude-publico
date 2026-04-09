'use client';

import type { ChatContext } from '../../types/chat';
import { beneficiariosMock } from '../../data/mock';

type Props = {
  context?: ChatContext;
};

const SCREEN_LABELS: Record<ChatContext['screen'], string> = {
  dashboard: 'Dashboard',
  beneficiarios: 'Beneficiários',
  beneficiario_detalhe: 'Detalhe do beneficiário',
  beneficiario_score: 'Score do beneficiário',
  beneficiario_plano: 'Plano assistencial',
  alertas: 'Alertas',
  eficiencia: 'Eficiência',
  eficiencia_detalhe: 'Eficiência detalhada',
};

export default function ChatContextChips({ context }: Props) {
  if (!context) return null;

  const beneficiario =
    context.beneficiaryId != null
      ? beneficiariosMock.find((item) => item.id === context.beneficiaryId)
      : null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        {SCREEN_LABELS[context.screen]}
      </span>
      {beneficiario ? (
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {beneficiario.nome}
        </span>
      ) : null}
      {context.area ? (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Área: {context.area}
        </span>
      ) : null}
      {context.efficiencyType ? (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {context.efficiencyType}
        </span>
      ) : null}
    </div>
  );
}
