import type { Beneficiario, EventoMedico, Risco } from '../types';

export type TipoOportunidade =
  | 'PA evitável'
  | 'Exame com possível redundância'
  | 'Consulta com baixa resolutividade'
  | 'Repetição assistencial';

export type OportunidadeEficiencia = {
  id: string;
  beneficiarioId: string;
  nome: string;
  area: string;
  score: number;
  risco: Risco;
  tipo: TipoOportunidade;
  frequencia: string;
  custo: number;
  potencialOtimizacao: number;
  acao: string;
};

const JANELA_REDUNDANCIA_EXAME_DIAS = 15;
const JANELA_PA_EVITAVEL_DIAS = 45;
const JANELA_BAIXA_RESOLUTIVIDADE_DIAS = 120;
const JANELA_REPETICAO_ASSISTENCIAL_DIAS = 30;

function contarEventos(eventos: EventoMedico[], tipo: EventoMedico['tipo']) {
  return eventos.filter((evento) => evento.tipo === tipo);
}

function eventosEmJanela(eventos: EventoMedico[], janela: number) {
  return eventos.filter((evento) => evento.diasAtras <= janela);
}

function maiorGrupoCoincidente(eventos: EventoMedico[], janela: number) {
  if (eventos.length < 3) return [];
  const ordenados = [...eventos].sort((a, b) => a.diasAtras - b.diasAtras);

  let melhorGrupo: EventoMedico[] = [];
  let inicio = 0;

  for (let fim = 0; fim < ordenados.length; fim += 1) {
    while (ordenados[fim].diasAtras - ordenados[inicio].diasAtras > janela) {
      inicio += 1;
    }

    const grupoAtual = ordenados.slice(inicio, fim + 1);

    if (
      grupoAtual.length > melhorGrupo.length ||
      (grupoAtual.length === melhorGrupo.length &&
        grupoAtual.length >= 3 &&
        grupoAtual[grupoAtual.length - 1].diasAtras - grupoAtual[0].diasAtras <
          (melhorGrupo[melhorGrupo.length - 1]?.diasAtras ?? Infinity) -
            (melhorGrupo[0]?.diasAtras ?? 0))
    ) {
      melhorGrupo = grupoAtual;
    }
  }

  return melhorGrupo.length >= 3 ? melhorGrupo : [];
}

type GrupoExamesRedundantes = {
  nome: string | null;
  grupo: EventoMedico[];
};

function obterMelhorJanelaRedundante(grupo: EventoMedico[], janelaMaxima: number) {
  if (grupo.length < 2) return [];

  const ordenados = [...grupo].sort((a, b) => a.diasAtras - b.diasAtras);
  let melhorJanela: EventoMedico[] = [];
  let inicio = 0;

  for (let fim = 0; fim < ordenados.length; fim += 1) {
    while (ordenados[fim].diasAtras - ordenados[inicio].diasAtras > janelaMaxima) {
      inicio += 1;
    }

    const janelaAtual = ordenados.slice(inicio, fim + 1);
    if (janelaAtual.length >= 2 && janelaAtual.length > melhorJanela.length) {
      melhorJanela = janelaAtual;
    }
  }

  return melhorJanela;
}

function grupoRedundante(exames: EventoMedico[]): GrupoExamesRedundantes {
  const grupos = exames.reduce((acc, exame) => {
    const key = (exame.nome ?? '').trim();
    if (!key) return acc;
    acc[key] = acc[key] ? [...acc[key], exame] : [exame];
    return acc;
  }, {} as Record<string, EventoMedico[]>);

  let melhorNome: string | null = null;
  let melhorGrupo: EventoMedico[] = [];

  Object.entries(grupos).forEach(([nome, grupo]) => {
    const janelaMaisCurta = obterMelhorJanelaRedundante(grupo, JANELA_REDUNDANCIA_EXAME_DIAS);

    if (
      janelaMaisCurta.length >= 2 &&
      (
        janelaMaisCurta.length > melhorGrupo.length ||
        (
          janelaMaisCurta.length === melhorGrupo.length &&
          (janelaMaisCurta[janelaMaisCurta.length - 1]?.diasAtras ?? Infinity) -
            (janelaMaisCurta[0]?.diasAtras ?? 0) <
            (melhorGrupo[melhorGrupo.length - 1]?.diasAtras ?? Infinity) -
              (melhorGrupo[0]?.diasAtras ?? 0)
        )
      )
    ) {
      melhorGrupo = janelaMaisCurta;
      melhorNome = nome;
    }
  });

  return { nome: melhorNome, grupo: melhorGrupo };
}

function getCustoBase(tipo: TipoOportunidade, score: number) {
  const multiplicador = Math.max(1, Math.round(score / 20));
  if (tipo === 'PA evitável') return 1450 + multiplicador * 430;
  if (tipo === 'Exame com possível redundância') return 980 + multiplicador * 330;
  if (tipo === 'Consulta com baixa resolutividade') return 760 + multiplicador * 260;
  return 900 + multiplicador * 270;
}

function getPotencialOtimizacao(tipo: TipoOportunidade, score: number) {
  const base =
    tipo === 'PA evitável' ? 78 :
    tipo === 'Exame com possível redundância' ? 66 :
    tipo === 'Consulta com baixa resolutividade' ? 58 : 61;
  const ajuste = score >= 80 ? 3 : score <= 30 ? -2 : 0;
  return Math.max(45, Math.min(92, base + ajuste));
}

function getAcao(tipo: TipoOportunidade) {
  if (tipo === 'PA evitável') return 'Retomar acompanhamento clínico estruturado';
  if (tipo === 'Exame com possível redundância') return 'Revisar indicação e evitar duplicidade';
  if (tipo === 'Consulta com baixa resolutividade') return 'Centralizar cuidado e definir plano assistencial';
  return 'Atuar para reduzir recorrência assistencial';
}

function montarFrequencia(tipo: TipoOportunidade, eventos: EventoMedico[]) {
  if (tipo === 'PA evitável') {
    const pa = eventosEmJanela(contarEventos(eventos, 'Pronto atendimento'), JANELA_PA_EVITAVEL_DIAS);
    return `${pa.length} ida(s) ao PA em até ${JANELA_PA_EVITAVEL_DIAS} dias`;
  }

  if (tipo === 'Exame com possível redundância') {
    const redundante = grupoRedundante(contarEventos(eventos, 'Exame'));
    return `${redundante.grupo.length} ocorrência(s) de ${redundante.nome ?? 'exame repetido'} em até ${JANELA_REDUNDANCIA_EXAME_DIAS} dias`;
  }

  if (tipo === 'Consulta com baixa resolutividade') {
    const consultas = eventosEmJanela(contarEventos(eventos, 'Consulta'), JANELA_BAIXA_RESOLUTIVIDADE_DIAS);
    return `${consultas.length} consulta(s) em até ${JANELA_BAIXA_RESOLUTIVIDADE_DIAS} dias`;
  }

  const janela30 = maiorGrupoCoincidente(eventos, JANELA_REPETICAO_ASSISTENCIAL_DIAS);
  return `${janela30.length} evento(s) coincidentes em até ${JANELA_REPETICAO_ASSISTENCIAL_DIAS} dias`;
}

export function obterEventosCoincidentesRepeticao(beneficiario: Beneficiario) {
  return maiorGrupoCoincidente(beneficiario.eventos ?? [], JANELA_REPETICAO_ASSISTENCIAL_DIAS);
}

export function identificarOportunidadeEficiencia(beneficiario: Beneficiario): TipoOportunidade | null {
  const eventos = beneficiario.eventos ?? [];
  const pa = contarEventos(eventos, 'Pronto atendimento');
  const exames = contarEventos(eventos, 'Exame');
  const consultas = contarEventos(eventos, 'Consulta');

  const redundante = grupoRedundante(exames);
  if (redundante.grupo.length >= 2) return 'Exame com possível redundância';

  const pa45 = eventosEmJanela(pa, JANELA_PA_EVITAVEL_DIAS);
  if (pa45.length >= 2) return 'PA evitável';

  const consultas120 = eventosEmJanela(consultas, JANELA_BAIXA_RESOLUTIVIDADE_DIAS);
  if (consultas120.length >= 3) return 'Consulta com baixa resolutividade';

  const janela30 = maiorGrupoCoincidente(eventos, JANELA_REPETICAO_ASSISTENCIAL_DIAS);
  if (janela30.length >= 3) return 'Repetição assistencial';

  return null;
}

function gerarOportunidade(beneficiario: Beneficiario, tipo: TipoOportunidade): OportunidadeEficiencia {
  return {
    id: `${beneficiario.id}-${tipo.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`,
    beneficiarioId: String(beneficiario.id),
    nome: beneficiario.nome,
    area: beneficiario.area,
    score: beneficiario.score,
    risco: beneficiario.risco,
    tipo,
    frequencia: montarFrequencia(tipo, beneficiario.eventos ?? []),
    custo: getCustoBase(tipo, beneficiario.score),
    potencialOtimizacao: getPotencialOtimizacao(tipo, beneficiario.score),
    acao: getAcao(tipo),
  };
}

export function listarOportunidadesEficiencia(beneficiarios: Beneficiario[]): OportunidadeEficiencia[] {
  return beneficiarios
    .map((beneficiario) => {
      const tipo = identificarOportunidadeEficiencia(beneficiario);
      if (!tipo) return null;
      return gerarOportunidade(beneficiario, tipo);
    })
    .filter((item): item is OportunidadeEficiencia => item !== null);
}

export function obterResumoOportunidade(beneficiario: Beneficiario) {
  const tipo = identificarOportunidadeEficiencia(beneficiario);
  if (!tipo) return null;

  const oportunidade = gerarOportunidade(beneficiario, tipo);
  const eventos = beneficiario.eventos ?? [];

  if (tipo === 'PA evitável') {
    const pa45 = eventosEmJanela(contarEventos(eventos, 'Pronto atendimento'), JANELA_PA_EVITAVEL_DIAS);
    return {
      ...oportunidade,
      justificativa: `O histórico mostra ${pa45.length} passagem(ns) por pronto atendimento dentro da janela crítica de ${JANELA_PA_EVITAVEL_DIAS} dias, sugerindo oportunidade de reforçar seguimento ambulatorial e reduzir uso evitável da rede.`,
    };
  }

  if (tipo === 'Exame com possível redundância') {
    const redundante = grupoRedundante(contarEventos(eventos, 'Exame'));
    return {
      ...oportunidade,
      justificativa: `Há repetição real de ${redundante.nome ?? 'um mesmo exame'} em janela clínica curta de até ${JANELA_REDUNDANCIA_EXAME_DIAS} dias, com oportunidade concreta de revisar indicação, sequência diagnóstica e reduzir duplicidade.`,
    };
  }

  if (tipo === 'Consulta com baixa resolutividade') {
    const consultas120 = eventosEmJanela(contarEventos(eventos, 'Consulta'), JANELA_BAIXA_RESOLUTIVIDADE_DIAS);
    return {
      ...oportunidade,
      justificativa: `O histórico reúne ${consultas120.length} consulta(s) dentro de ${JANELA_BAIXA_RESOLUTIVIDADE_DIAS} dias, com manutenção de criticidade operacional e indício de baixa resolutividade assistencial.`,
    };
  }

  const janela30 = maiorGrupoCoincidente(eventos, JANELA_REPETICAO_ASSISTENCIAL_DIAS);
  const linhas = Array.from(
    new Set(janela30.map((evento) => evento.especialidadeAssistencial).filter(Boolean))
  ) as string[];
  const complementoLinhas =
    linhas.length === 1
      ? ` no eixo de ${linhas[0]}`
      : linhas.length > 1
        ? ` atravessando ${linhas.join(', ')}`
        : '';

  return {
    ...oportunidade,
    justificativa: `Há ${janela30.length} evento(s) coincidentes na janela fixa de ${JANELA_REPETICAO_ASSISTENCIAL_DIAS} dias${complementoLinhas}, com oportunidade de melhor coordenação para reduzir repetição e racionalizar a jornada de cuidado.`,
  };
}
