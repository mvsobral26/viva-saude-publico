import { gerarAcoesIA, type AcaoIA, type ResponsavelFluxo } from '../data/acoes-ia';
import { gerarAlertas, type AlertaGerado } from './alerts';
import type { Beneficiario, RiskEvolution } from '../types';
import { gerarEvolucaoRisco } from './riskEvolution';

export type PerfilClinico =
  | 'Cardiometabólico'
  | 'Respiratório'
  | 'Saúde mental'
  | 'Musculoesquelético'
  | 'Renal'
  | 'Oncológico'
  | 'Neurológico'
  | 'Preventivo / estável';

export type FilaOperacionalStatus = 'Ação imediata' | 'Ativar nesta semana' | 'Monitorar';
export type ModoFila = 'Fila operacional' | 'Base completa';

export type BeneficiarioOperacional = Beneficiario & {
  perfilClinico: PerfilClinico;
  alertasGerados: AlertaGerado[];
  evolucao: RiskEvolution;
  acoesIA: AcaoIA[];
  proximaAcao: AcaoIA;
  fluxo: ResponsavelFluxo;
  filaStatus: FilaOperacionalStatus;
  sinaisPrioritarios: string[];
};

function normalizarTexto(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function obterPerfilClinico(beneficiario: {
  condicao?: string;
  declaracao?: {
    hipertensao?: boolean;
    diabetes?: boolean;
  };
}): PerfilClinico {
  const condicao = normalizarTexto(beneficiario.condicao ?? '');
  const declaracao = beneficiario.declaracao ?? {};

  const temCardiometabolico =
    declaracao.hipertensao ||
    declaracao.diabetes ||
    condicao.includes('hipertens') ||
    condicao.includes('diabet') ||
    condicao.includes('obes') ||
    condicao.includes('metab') ||
    condicao.includes('dislip') ||
    condicao.includes('cardio');

  const temRespiratorio =
    condicao.includes('asma') ||
    condicao.includes('dpoc') ||
    condicao.includes('respir');

  const temSaudeMental =
    condicao.includes('saude mental') ||
    condicao.includes('saude ment') ||
    condicao.includes('mental');

  const temMusculoesqueletico =
    condicao.includes('fibromial') ||
    condicao.includes('osteomus') ||
    condicao.includes('artrite') ||
    condicao.includes('musculoesquelet');

  const temRenal = condicao.includes('renal');
  const temOncologico = condicao.includes('oncolo');
  const temNeurologico = condicao.includes('neuro');

  if (temCardiometabolico) return 'Cardiometabólico';
  if (temRespiratorio) return 'Respiratório';
  if (temSaudeMental) return 'Saúde mental';
  if (temMusculoesqueletico) return 'Musculoesquelético';
  if (temRenal) return 'Renal';
  if (temOncologico) return 'Oncológico';
  if (temNeurologico) return 'Neurológico';
  return 'Preventivo / estável';
}

function ordenarAcoes(acoes: AcaoIA[]) {
  const ordemPrioridade = { Alta: 0, Média: 1, Baixa: 2 };

  return [...acoes].sort((a, b) => {
    if (ordemPrioridade[a.prioridade] !== ordemPrioridade[b.prioridade]) {
      return ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
    }

    return b.impacto - a.impacto;
  });
}

function definirFilaStatus(
  fluxo: ResponsavelFluxo,
  evolucao: RiskEvolution,
  proximaAcao: AcaoIA
): FilaOperacionalStatus {
  const riscoAlto = evolucao.riscoFuturo === 'Alto';
  const riscoMedio = evolucao.riscoFuturo === 'Médio';
  const preCritico = evolucao.nivelPreRisco === 'Atenção imediata';
  const preAtivo = evolucao.nivelPreRisco === 'Pré-risco';

  const criticaAgora =
    riscoAlto &&
    (
      fluxo === 'Humano prioritário' ||
      preCritico ||
      proximaAcao.prioridade === 'Alta'
    );

  if (criticaAgora) {
    return 'Ação imediata';
  }

  const ativarSemana =
    riscoMedio ||
    (fluxo === 'IA assistida' && preAtivo) ||
    (fluxo === 'Humano prioritário' && (preAtivo || preCritico)) ||
    (evolucao.riscoFuturo === 'Baixo' && preCritico);

  if (ativarSemana) {
    return 'Ativar nesta semana';
  }

  return 'Monitorar';
}

function construirSinaisPrioritarios(evolucao: RiskEvolution, alertas: AlertaGerado[]) {
  const sinais = Array.from(
    new Set([
      ...evolucao.drivers.map((driver) => driver.label),
      ...alertas.map((alerta) => alerta.mensagem),
    ])
  );

  return sinais.slice(0, 3);
}

export function enriquecerBeneficiariosOperacionais(beneficiarios: Beneficiario[]): BeneficiarioOperacional[] {
  return beneficiarios.map((beneficiario) => {
    const perfilClinico = obterPerfilClinico(beneficiario);
    const alertasGerados = gerarAlertas(beneficiario);
    const evolucao = gerarEvolucaoRisco(beneficiario);
    const acoesOrdenadas = ordenarAcoes(gerarAcoesIA(beneficiario));
    const proximaAcao = acoesOrdenadas[0];
    const fluxo = proximaAcao.responsavelFluxo;
    const filaStatus = definirFilaStatus(fluxo, evolucao, proximaAcao);
    const sinaisPrioritarios = construirSinaisPrioritarios(evolucao, alertasGerados);

    return {
      ...beneficiario,
      perfilClinico,
      alertasGerados,
      evolucao,
      acoesIA: acoesOrdenadas,
      proximaAcao,
      fluxo,
      filaStatus,
      sinaisPrioritarios,
    };
  });
}

export function ordenarFilaOperacional(beneficiarios: BeneficiarioOperacional[]) {
  const ordemFila: Record<FilaOperacionalStatus, number> = {
    'Ação imediata': 0,
    'Ativar nesta semana': 1,
    Monitorar: 2,
  };

  const ordemFluxo: Record<ResponsavelFluxo, number> = {
    'Humano prioritário': 0,
    'IA assistida': 1,
    'Preventivo automatizado': 2,
  };

  const ordemRisco = { Alto: 0, Médio: 1, Baixo: 2 };
  const ordemPreRisco = {
    'Atenção imediata': 0,
    'Pré-risco': 1,
    Monitorar: 2,
    Estável: 3,
  };

  return [...beneficiarios].sort((a, b) => {
    if (ordemFila[a.filaStatus] !== ordemFila[b.filaStatus]) {
      return ordemFila[a.filaStatus] - ordemFila[b.filaStatus];
    }

    if (ordemFluxo[a.fluxo] !== ordemFluxo[b.fluxo]) {
      return ordemFluxo[a.fluxo] - ordemFluxo[b.fluxo];
    }

    if (ordemRisco[a.evolucao.riscoFuturo] !== ordemRisco[b.evolucao.riscoFuturo]) {
      return ordemRisco[a.evolucao.riscoFuturo] - ordemRisco[b.evolucao.riscoFuturo];
    }

    if (ordemPreRisco[a.evolucao.nivelPreRisco] !== ordemPreRisco[b.evolucao.nivelPreRisco]) {
      return ordemPreRisco[a.evolucao.nivelPreRisco] - ordemPreRisco[b.evolucao.nivelPreRisco];
    }

    if (ordemRisco[a.risco] !== ordemRisco[b.risco]) {
      return ordemRisco[a.risco] - ordemRisco[b.risco];
    }

    if (b.proximaAcao.impacto !== a.proximaAcao.impacto) {
      return b.proximaAcao.impacto - a.proximaAcao.impacto;
    }

    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return b.custoPotencial30d - a.custoPotencial30d;
  });
}
