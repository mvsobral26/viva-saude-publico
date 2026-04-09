import type { ChatContext, ChatIntent } from '../../types/chat';
import { INTENT_KEYWORDS } from './intents';
import { findAreaInMessage, findBeneficiaryInMessage } from '../domain/search.service';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export type ParsedChatIntent = {
  intent: ChatIntent;
  beneficiaryId?: number;
  area?: string;
};

export function parseIntent(message: string, context?: ChatContext): ParsedChatIntent {
  const normalized = normalize(message);
  const namedBeneficiary = findBeneficiaryInMessage(message);
  const mentionedArea = findAreaInMessage(message);

  if (
    context?.beneficiaryId &&
    (normalized.includes('score') || normalized.includes('por que') || normalized.includes('porque'))
  ) {
    return { intent: 'EXPLICAR_SCORE', beneficiaryId: context.beneficiaryId };
  }

  if (
    context?.beneficiaryId &&
    (normalized.includes('resuma') || normalized.includes('resumo') || normalized.includes('este benefici'))
  ) {
    return { intent: 'RESUMIR_BENEFICIARIO', beneficiaryId: context.beneficiaryId };
  }

  if (mentionedArea && (normalized.includes('area') || normalized.includes('área') || normalized.includes('resuma'))) {
    return { intent: 'RESUMIR_AREA', area: mentionedArea };
  }

  if (namedBeneficiary && (normalized.includes('resuma') || normalized.includes('score') || normalized.includes('alerta'))) {
    return {
      intent: normalized.includes('alerta')
        ? 'EXPLICAR_ALERTAS'
        : normalized.includes('score')
        ? 'EXPLICAR_SCORE'
        : 'RESUMIR_BENEFICIARIO',
      beneficiaryId: namedBeneficiary.id,
    };
  }

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(normalize(keyword)))) {
      return {
        intent: intent as ChatIntent,
        beneficiaryId: context?.beneficiaryId,
        area: context?.area ?? mentionedArea ?? undefined,
      };
    }
  }

  if (context?.beneficiaryId) {
    return { intent: 'RESUMIR_BENEFICIARIO', beneficiaryId: context.beneficiaryId };
  }

  return { intent: 'NAO_ENTENDIDA', area: context?.area ?? mentionedArea ?? undefined };
}
