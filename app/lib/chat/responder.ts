import type { ChatReference, ChatResponse } from '../../types/chat';

export function buildResponse(
  intent: ChatResponse['intent'],
  answer: string,
  references: ChatReference[] = [],
  followUps: string[] = []
): ChatResponse {
  return {
    intent,
    answer,
    references,
    followUps,
    safe: true,
  };
}
