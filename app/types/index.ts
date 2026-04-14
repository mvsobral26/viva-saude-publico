export type Risco = 'Alto' | 'Médio' | 'Baixo';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  precisa2FA: boolean;
  codigo2FA?: string;
  perfil: 'Administrador' | 'Analista' | 'Operador';
};

export type DoencasPreexistentes = {
  hipertensao?: boolean;
  diabetes?: boolean;
  obesidade?: boolean;
  cardiopatia?: boolean;
  insuficienciaCardiaca?: boolean;
  arritmia?: boolean;
  asma?: boolean;
  bronquite?: boolean;
  dpoc?: boolean;
  doencaRenalCronica?: boolean;
  historicoOncologico?: boolean;
  tumorBenigno?: boolean;
  parkinson?: boolean;
  alzheimer?: boolean;
  epilepsia?: boolean;
  doencaNeurologica?: boolean;
  depressao?: boolean;
  ansiedade?: boolean;
  doencaAutoimune?: boolean;
  hiv?: boolean;
  herniaDeDisco?: boolean;
  artrose?: boolean;
  artrite?: boolean;
  osteoporose?: boolean;
};

export type HabitosVida = {
  fumante?: boolean;
  tabagismo?: boolean;
  consumoAlcoolFrequente?: boolean;
  alcoolFrequente?: boolean;
  atividadeFisicaRegular?: boolean;
  alimentacaoEquilibrada?: boolean;
  sonoAdequado?: boolean;
  estresseElevado?: boolean;
};

export type DadosFisicos = {
  imc?: number;
  pesoKg?: number;
  alturaM?: number;
};

export type TratamentosContinuos = {
  usaMedicacaoContinua?: boolean;
  polifarmacia?: boolean;
  insulinoterapia?: boolean;
  anticoagulante?: boolean;
  imunossupressor?: boolean;
  tratamentoOncologicoAtual?: boolean;
};

export type InternacoesExames = {
  internacaoRecente?: boolean;
  internacaoUltimos12Meses?: boolean;
  internacaoUltimos30Dias?: boolean;
  utiPrevia?: boolean;
  acompanhamentoRegular?: boolean;
  acompanhamentoMedicoAtual?: boolean;
  prontoAtendimentoRecorrente?: boolean;
  exameComplexoRecente?: boolean;
  tomografiaRecente?: boolean;
  ressonanciaRecente?: boolean;
  biopsiaRecente?: boolean;
};

export type PercepcaoSaude = {
  dorCronica?: boolean;
  limitacaoMobilidade?: boolean;
  fadigaRecorrente?: boolean;
  autoavaliacaoSaude?: 'Boa' | 'Regular' | 'Ruim';
};


export type HistoricoFamiliarCondicao =
  | 'Diabetes'
  | 'Hipertensão'
  | 'Doença cardiovascular'
  | 'Câncer'
  | 'Doença renal crônica'
  | 'Doença respiratória crônica'
  | 'Doença neurológica degenerativa';

export type HistoricoFamiliar = {
  condicoes: HistoricoFamiliarCondicao[];
};

export type DeclaracaoSaude = {
  hipertensao: boolean;
  diabetes: boolean;
  tabagismo: boolean;
  alcoolFrequente: boolean;
  atividadeFisicaRegular: boolean;
  internacaoRecente: boolean;
  acompanhamentoRegular: boolean;
  doencasPreexistentes?: DoencasPreexistentes;
  habitosVida?: HabitosVida;
  dadosFisicos?: DadosFisicos;
  tratamentosContinuos?: TratamentosContinuos;
  internacoesExames?: InternacoesExames;
  percepcaoSaude?: PercepcaoSaude;
  historicoFamiliar?: HistoricoFamiliar;
};

export type Medicamento = {
  nome: string;
  classe?: string;
};

export type TipoEventoMedico =
  | 'Consulta'
  | 'Exame'
  | 'Pronto atendimento'
  | 'Internação'
  | 'Procedimento';

export type StatusEventoMedico = 'Realizado' | 'Agendado';

export type EspecialidadeAssistencial =
  | 'Cardiologia'
  | 'Endocrinologia'
  | 'Pneumologia'
  | 'Nefrologia'
  | 'Neurologia'
  | 'Oncologia'
  | 'Ortopedia'
  | 'Gastroenterologia'
  | 'Clínica geral';

export type EventoMedico = {
  tipo: TipoEventoMedico;
  diasAtras: number;
  nome?: string;
  categoria?: string;
  status?: StatusEventoMedico;
  especialidadeAssistencial?: EspecialidadeAssistencial;
};

export type NivelPreRisco = 'Estável' | 'Monitorar' | 'Pré-risco' | 'Atenção imediata';

export type JanelaRiscoFuturo = '30 dias' | '60 dias' | '90 dias' | '120 dias';

export type CategoriaRiscoFuturo =
  | 'Descompensação metabólica'
  | 'Risco cardiovascular'
  | 'Uso agudo evitável'
  | 'Progressão de complexidade assistencial'
  | 'Escalada de custo provável'
  | 'Sem sinal relevante';

export type CodigoDriverRisco =
  | 'sem_acompanhamento'
  | 'pronto_atendimento_recorrente'
  | 'baixa_resolutividade'
  | 'repeticao_assistencial'
  | 'redundancia_exames'
  | 'polifarmacia'
  | 'internacao_recente'
  | 'diabetes_sem_monitoramento'
  | 'hipertensao_sem_monitoramento'
  | 'cardiopatia_ativa'
  | 'imc_elevado'
  | 'sedentarismo'
  | 'fumante'
  | 'estresse_elevado';

export type RiskDriver = {
  codigo: CodigoDriverRisco;
  label: string;
  pontos: number;
  evidencias: string[];
};

export type RiskEvolution = {
  nivelPreRisco: NivelPreRisco;
  scorePreRisco: number;
  riscoFuturo: Risco;
  probabilidadeRiscoFuturo: number;
  janelaRiscoFuturo: JanelaRiscoFuturo;
  categoriaPrincipal: CategoriaRiscoFuturo;
  drivers: RiskDriver[];
  justificativaAnalitica: string;
  recomendacaoPrimaria: string;
};

export type Beneficiario = {
  id: number;
  nome: string;
  cpf: string;
  idade: number;
  area: string;
  score: number;
  risco: Risco;
  ultimoEventoDias: number;
  custoPotencial30d: number;
  status: string;
  condicao: string;
  alerta: string;
  declaracao: DeclaracaoSaude;
  medicamentos: Medicamento[];
  eventos: EventoMedico[];
};
