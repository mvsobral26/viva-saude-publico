export type ChatScreenContext =
  | 'dashboard'
  | 'beneficiarios'
  | 'beneficiario_detalhe'
  | 'beneficiario_score'
  | 'beneficiario_plano'
  | 'alertas'
  | 'eficiencia'
  | 'eficiencia_detalhe';

export type ChatIntent =
  | 'LISTAR_CRITICOS'
  | 'LISTAR_SEM_ACOMPANHAMENTO'
  | 'EXPLICAR_SCORE'
  | 'LISTAR_REDUNDANCIA'
  | 'LISTAR_REPETICAO_ASSISTENCIAL'
  | 'RESUMIR_AREA'
  | 'RESUMIR_BENEFICIARIO'
  | 'EXPLICAR_ALERTAS'
  | 'NAO_ENTENDIDA'
  | 'FORA_DE_ESCOPO';

export interface ChatContext {
  screen: ChatScreenContext;
  beneficiaryId?: number;
  area?: string;
  efficiencyType?:
    | 'PA evitável'
    | 'Exame com possível redundância'
    | 'Consulta com baixa resolutividade'
    | 'Repetição assistencial';
}

export interface ChatRequest {
  message: string;
  context?: ChatContext;
}

export interface ChatReference {
  type: 'beneficiario' | 'area' | 'rota' | 'eficiencia' | 'alerta';
  id?: number | string;
  label: string;
  href?: string;
}

export interface ChatResponse {
  intent: ChatIntent;
  answer: string;
  references: ChatReference[];
  followUps: string[];
  safe: true;
}
