import { OUT_OF_SCOPE_KEYWORDS } from './intents';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function isOutOfScopeMedicalQuestion(message: string) {
  const normalized = normalize(message);
  return OUT_OF_SCOPE_KEYWORDS.some((term) => normalized.includes(normalize(term)));
}
