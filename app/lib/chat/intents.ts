import type { ChatIntent } from '../../types/chat';

export const INTENT_KEYWORDS: Record<Exclude<ChatIntent, 'NAO_ENTENDIDA' | 'FORA_DE_ESCOPO'>, string[]> = {
  LISTAR_CRITICOS: ['casos criticos', 'casos críticos', 'mais criticos', 'mais críticos', 'alto risco', 'prioridade', 'prioritarios'],
  LISTAR_SEM_ACOMPANHAMENTO: ['sem acompanhamento', 'descontinuidade', 'acompanhamento pendente'],
  EXPLICAR_SCORE: ['explique score', 'explicar score', 'por que score', 'motivo do score', 'por que ele esta critico', 'por que ele está crítico'],
  LISTAR_REDUNDANCIA: ['redundancia', 'redundância', 'exame duplicado', 'exame repetido'],
  LISTAR_REPETICAO_ASSISTENCIAL: ['repeticao assistencial', 'repetição assistencial', 'muitos eventos', 'recorrencia assistencial', 'recorrência assistencial'],
  RESUMIR_AREA: ['resuma a area', 'resuma a área', 'resumo da area', 'resumo da área', 'como esta a area', 'como está a área'],
  RESUMIR_BENEFICIARIO: ['resuma beneficiario', 'resuma beneficiário', 'resuma este beneficiario', 'resuma este beneficiário', 'resumo do beneficiario', 'resumo do beneficiário'],
  EXPLICAR_ALERTAS: ['explique alertas', 'quais alertas', 'explicar alertas', 'motivo dos alertas'],
};

export const OUT_OF_SCOPE_KEYWORDS = [
  'tratamento',
  'diagnostico',
  'diagnóstico',
  'dose',
  'prescrever',
  'medicacao',
  'medicação',
  'qual remedio',
  'qual remédio',
  'conduta',
];
