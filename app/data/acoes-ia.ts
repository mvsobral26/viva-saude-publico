import type { Beneficiario } from '../types';
import { gerarAlertas, type AlertaGerado } from '../utils/alerts';
import { gerarEvolucaoRisco } from '../utils/riskEvolution';

export type PrioridadeAcaoIA = 'Alta' | 'Média' | 'Baixa';
export type ResponsavelFluxo = 'Humano prioritário' | 'IA assistida' | 'Preventivo automatizado';

export type AcaoIA = {
  id: string;
  titulo: string;
  descricao: string;
  impacto: number;
  prioridade: PrioridadeAcaoIA;
  alertasOrigem: string[];
  responsavelFluxo: ResponsavelFluxo;
};

function prioridadePorAlertas(alertas: AlertaGerado[]): PrioridadeAcaoIA {
  if (alertas.some((a) => a.tipo === 'Crítico')) return 'Alta';
  if (alertas.filter((a) => a.tipo === 'Alto').length >= 2) return 'Alta';
  if (alertas.some((a) => a.tipo === 'Alto' || a.tipo === 'Médio')) return 'Média';
  return 'Baixa';
}

function prioridadePorEvolucao(probabilidade: number): PrioridadeAcaoIA {
  if (probabilidade >= 78) return 'Alta';
  if (probabilidade >= 52) return 'Média';
  return 'Baixa';
}

function maiorPrioridade(a: PrioridadeAcaoIA, b: PrioridadeAcaoIA): PrioridadeAcaoIA {
  const ordem: Record<PrioridadeAcaoIA, number> = { Alta: 3, Média: 2, Baixa: 1 };
  return ordem[a] >= ordem[b] ? a : b;
}

function impactoPorAlertas(base: number, alertas: AlertaGerado[]) {
  const bonusCritico = alertas.filter((a) => a.tipo === 'Crítico').length * 3;
  const bonusAlto = alertas.filter((a) => a.tipo === 'Alto').length * 2;
  const bonusMedio = alertas.filter((a) => a.tipo === 'Médio').length * 1;
  return Math.min(base + bonusCritico + bonusAlto + bonusMedio, base + 8);
}

function impactoPorEvolucao(base: number, probabilidade: number) {
  const ajuste = probabilidade >= 75 ? 4 : probabilidade >= 60 ? 2 : 0;
  return Math.min(base + ajuste, base + 6);
}

function determinarFluxo(beneficiario: Beneficiario): ResponsavelFluxo {
  const evolucao = gerarEvolucaoRisco(beneficiario);
  const alertas = gerarAlertas(beneficiario);

  const precisaHumano =
    (
      evolucao.riscoFuturo === 'Alto' &&
      (
        evolucao.nivelPreRisco === 'Atenção imediata' ||
        evolucao.categoriaPrincipal === 'Risco cardiovascular' ||
        evolucao.categoriaPrincipal === 'Descompensação metabólica' ||
        beneficiario.score >= 60
      )
    ) ||
    alertas.some((alerta) => alerta.tipo === 'Crítico');

  if (precisaHumano) {
    return 'Humano prioritário';
  }

  if (
    evolucao.riscoFuturo === 'Médio' ||
    evolucao.nivelPreRisco === 'Pré-risco' ||
    evolucao.nivelPreRisco === 'Atenção imediata'
  ) {
    return 'IA assistida';
  }

  return 'Preventivo automatizado';
}

function agruparAlertas(alertas: AlertaGerado[]) {
  return {
    acompanhamento: alertas.filter((a) =>
      [
        'Diabetes sem acompanhamento regular',
        'Hipertensão sem acompanhamento regular',
        'Possível abandono de acompanhamento',
        'Sem consulta há mais de 180 dias',
      ].includes(a.mensagem)
    ),
    cronicos: alertas.filter((a) =>
      [
        'Diabetes sem acompanhamento regular',
        'Hipertensão sem acompanhamento regular',
        'Condição cardiovascular crônica',
      ].includes(a.mensagem)
    ),
    estiloVida: alertas.filter((a) =>
      ['Sedentarismo declarado', 'Obesidade / IMC elevado', 'Perfil estável, manter prevenção'].includes(a.mensagem)
    ),
    medicamentoso: alertas.filter((a) =>
      ['Uso contínuo de múltiplos medicamentos', 'Internação recente com polifarmácia', 'Tratamento contínuo de alta vigilância'].includes(a.mensagem)
    ),
    utilizacaoAguda: alertas.filter((a) =>
      ['Uso recente de pronto atendimento', 'Alto custo potencial no curto prazo'].includes(a.mensagem)
    ),
  };
}

export function gerarAcoesIA(beneficiario: Beneficiario): AcaoIA[] {
  const alertas = gerarAlertas(beneficiario);
  const evolucao = gerarEvolucaoRisco(beneficiario);
  const grupos = agruparAlertas(alertas);
  const fluxo = determinarFluxo(beneficiario);
  const prioridadeEvolucao = prioridadePorEvolucao(evolucao.probabilidadeRiscoFuturo);
  const acoes: AcaoIA[] = [];

  if (grupos.acompanhamento.length > 0 || evolucao.drivers.some((driver) => driver.codigo === 'sem_acompanhamento')) {
    acoes.push({
      id: 'acompanhamento-estruturado',
      titulo: 'Retomar acompanhamento clínico estruturado',
      descricao:
        'Reativar acompanhamento assistencial, organizar agenda clínica e restabelecer monitoramento periódico para reduzir progressão para risco futuro mais alto.',
      impacto: impactoPorEvolucao(impactoPorAlertas(12, grupos.acompanhamento), evolucao.probabilidadeRiscoFuturo),
      prioridade: maiorPrioridade(prioridadePorAlertas(grupos.acompanhamento), prioridadeEvolucao),
      alertasOrigem: Array.from(new Set([
        ...grupos.acompanhamento.map((a) => a.mensagem),
        ...evolucao.drivers
          .filter((driver) => driver.codigo === 'sem_acompanhamento')
          .map((driver) => driver.label),
      ])),
      responsavelFluxo: fluxo,
    });
  }

  if (
    grupos.cronicos.length > 0 ||
    ['Risco cardiovascular', 'Descompensação metabólica'].includes(evolucao.categoriaPrincipal)
  ) {
    acoes.push({
      id: 'controle-cronicos',
      titulo: 'Intensificar controle de condições crônicas',
      descricao:
        'Executar plano focado em controle glicêmico e pressórico, revisar adesão terapêutica e antecipar descompensação clínica provável.',
      impacto: impactoPorEvolucao(impactoPorAlertas(14, grupos.cronicos), evolucao.probabilidadeRiscoFuturo),
      prioridade: maiorPrioridade(prioridadePorAlertas(grupos.cronicos), prioridadeEvolucao),
      alertasOrigem: Array.from(new Set([
        ...grupos.cronicos.map((a) => a.mensagem),
        evolucao.categoriaPrincipal,
      ])),
      responsavelFluxo: fluxo,
    });
  }

  if (grupos.estiloVida.length > 0 || evolucao.drivers.some((driver) => ['sedentarismo', 'imc_elevado', 'fumante'].includes(driver.codigo))) {
    acoes.push({
      id: 'promocao-saude',
      titulo: 'Ativar plano de promoção de saúde',
      descricao:
        'Estimular atividade física, reforçar autocuidado e reduzir fatores de progressão comportamental antes da migração de risco.',
      impacto: impactoPorEvolucao(impactoPorAlertas(10, grupos.estiloVida), evolucao.probabilidadeRiscoFuturo),
      prioridade: maiorPrioridade(prioridadePorAlertas(grupos.estiloVida), prioridadeEvolucao),
      alertasOrigem: Array.from(new Set([
        ...grupos.estiloVida.map((a) => a.mensagem),
        ...evolucao.drivers
          .filter((driver) => ['sedentarismo', 'imc_elevado', 'fumante'].includes(driver.codigo))
          .map((driver) => driver.label),
      ])),
      responsavelFluxo: fluxo,
    });
  }

  if (grupos.medicamentoso.length > 0 || evolucao.drivers.some((driver) => ['polifarmacia', 'internacao_recente'].includes(driver.codigo))) {
    acoes.push({
      id: 'revisao-terapeutica',
      titulo: 'Realizar revisão terapêutica e medicamentosa',
      descricao:
        'Avaliar polifarmácia, simplificar esquema quando possível e monitorar segurança do tratamento para evitar progressão de complexidade.',
      impacto: impactoPorEvolucao(impactoPorAlertas(11, grupos.medicamentoso), evolucao.probabilidadeRiscoFuturo),
      prioridade: maiorPrioridade(prioridadePorAlertas(grupos.medicamentoso), prioridadeEvolucao),
      alertasOrigem: Array.from(new Set([
        ...grupos.medicamentoso.map((a) => a.mensagem),
        ...evolucao.drivers
          .filter((driver) => ['polifarmacia', 'internacao_recente'].includes(driver.codigo))
          .map((driver) => driver.label),
      ])),
      responsavelFluxo: fluxo,
    });
  }

  if (
    grupos.utilizacaoAguda.length > 0 ||
    ['Uso agudo evitável', 'Escalada de custo provável'].includes(evolucao.categoriaPrincipal)
  ) {
    acoes.push({
      id: 'gestao-utilizacao',
      titulo: 'Executar gestão intensiva de utilização assistencial',
      descricao:
        'Atuar sobre uso recente de pronto atendimento, repetição assistencial e risco de custo elevado com coordenação proativa do cuidado.',
      impacto: impactoPorEvolucao(impactoPorAlertas(13, grupos.utilizacaoAguda), evolucao.probabilidadeRiscoFuturo),
      prioridade: maiorPrioridade(prioridadePorAlertas(grupos.utilizacaoAguda), prioridadeEvolucao),
      alertasOrigem: Array.from(new Set([
        ...grupos.utilizacaoAguda.map((a) => a.mensagem),
        evolucao.categoriaPrincipal,
      ])),
      responsavelFluxo: fluxo,
    });
  }

  if (acoes.length === 0) {
    acoes.push({
      id: 'manter-prevencao',
      titulo: 'Manter acompanhamento preventivo',
      descricao:
        'Preservar rotina de prevenção, vigilância leve e reforço de autocuidado para sustentar perfil estável.',
      impacto: 5,
      prioridade: 'Baixa',
      alertasOrigem: ['Perfil estável, manter prevenção'],
      responsavelFluxo: fluxo,
    });
  }

  return acoes;
}
