import type { Beneficiario, Risco } from '../types';
import {
  listarOportunidadesEficiencia,
  type TipoOportunidade,
} from './efficiency';

export type ConfiguracaoSinistralidade = {
  receitaMensalCarteira: number;
  metaSinistralidade: number;
  faixaAtencao: number;
};

export type FaixaSinistralidade = 'Controlada' | 'Atenção' | 'Crítica';

export type ResumoSinistralidade = {
  custoTotalProjetado: number;
  receitaMensalCarteira: number;
  sinistralidadeAtual: number;
  economiaPotencial: number;
  sinistralidadeAjustada: number;
  gapMeta: number;
  faixa: FaixaSinistralidade;
  principalDriver: string;
  porRisco: Array<{
    risco: Risco;
    quantidade: number;
    custoTotal: number;
    participacaoCusto: number;
  }>;
  porOportunidade: Array<{
    tipo: TipoOportunidade;
    quantidade: number;
    custoEstimado: number;
    potencialReducao: number;
  }>;
};

function limitarPercentual(valor: number) {
  return Math.max(0, Number(valor.toFixed(4)));
}

function classificarFaixa(
  indice: number,
  meta: number,
  faixaAtencao: number
): FaixaSinistralidade {
  if (indice <= meta) return 'Controlada';
  if (indice <= faixaAtencao) return 'Atenção';
  return 'Crítica';
}

function ordenarOportunidades(
  a: { quantidade: number; custoEstimado: number; potencialReducao: number },
  b: { quantidade: number; custoEstimado: number; potencialReducao: number }
) {
  if (b.custoEstimado !== a.custoEstimado)
    return b.custoEstimado - a.custoEstimado;
  if (b.quantidade !== a.quantidade)
    return b.quantidade - a.quantidade;
  return b.potencialReducao - a.potencialReducao;
}

function getFatorReducao(oportunidade: TipoOportunidade) {
  if (oportunidade === 'PA evitável') return 0.22;
  if (oportunidade === 'Exame com possível redundância') return 0.35;
  if (oportunidade === 'Consulta com baixa resolutividade') return 0.18;
  return 0.15;
}

export function calcularResumoSinistralidade(
  beneficiarios: Beneficiario[],
  config: ConfiguracaoSinistralidade
): ResumoSinistralidade {
  // 🔹 custo total continua vindo do mock (correto)
  const custoTotalProjetado = beneficiarios.reduce(
    (acc, beneficiario) => acc + beneficiario.custoPotencial30d,
    0
  );

  // 🔹 distribuição por risco (mantido)
  const porRiscoBase: Record<
    Risco,
    { quantidade: number; custoTotal: number }
  > = {
    Alto: { quantidade: 0, custoTotal: 0 },
    Médio: { quantidade: 0, custoTotal: 0 },
    Baixo: { quantidade: 0, custoTotal: 0 },
  };

  beneficiarios.forEach((beneficiario) => {
    porRiscoBase[beneficiario.risco].quantidade += 1;
    porRiscoBase[beneficiario.risco].custoTotal +=
      beneficiario.custoPotencial30d;
  });

  // 🔥 FONTE ÚNICA DE VERDADE (EFFICIENCY)
  const oportunidades = listarOportunidadesEficiencia(beneficiarios);

  const oportunidadesBase: Record<
    TipoOportunidade,
    { quantidade: number; custoEstimado: number; potencialReducao: number }
  > = {
    'PA evitável': { quantidade: 0, custoEstimado: 0, potencialReducao: 0 },
    'Exame com possível redundância': {
      quantidade: 0,
      custoEstimado: 0,
      potencialReducao: 0,
    },
    'Consulta com baixa resolutividade': {
      quantidade: 0,
      custoEstimado: 0,
      potencialReducao: 0,
    },
    'Repetição assistencial': {
      quantidade: 0,
      custoEstimado: 0,
      potencialReducao: 0,
    },
  };

  oportunidades.forEach((item) => {
    const fatorReducao = getFatorReducao(item.tipo);

    oportunidadesBase[item.tipo].quantidade += 1;
    oportunidadesBase[item.tipo].custoEstimado += item.custo;
    oportunidadesBase[item.tipo].potencialReducao +=
      item.custo * fatorReducao;
  });

  const economiaPotencial = Object.values(oportunidadesBase).reduce(
    (acc, item) => acc + item.potencialReducao,
    0
  );

  const sinistralidadeAtual = limitarPercentual(
    custoTotalProjetado / config.receitaMensalCarteira
  );

  const sinistralidadeAjustada = limitarPercentual(
    Math.max(custoTotalProjetado - economiaPotencial, 0) /
      config.receitaMensalCarteira
  );

  const gapMeta = limitarPercentual(
    Math.max(sinistralidadeAtual - config.metaSinistralidade, 0)
  );

  const porRisco = (
    Object.entries(porRiscoBase) as Array<
      [Risco, { quantidade: number; custoTotal: number }]
    >
  )
    .map(([risco, valores]) => ({
      risco,
      quantidade: valores.quantidade,
      custoTotal: Math.round(valores.custoTotal),
      participacaoCusto:
        custoTotalProjetado > 0
          ? limitarPercentual(valores.custoTotal / custoTotalProjetado)
          : 0,
    }))
    .sort((a, b) => b.custoTotal - a.custoTotal);

  const porOportunidade = (
    Object.entries(oportunidadesBase) as Array<
      [
        TipoOportunidade,
        {
          quantidade: number;
          custoEstimado: number;
          potencialReducao: number;
        }
      ]
    >
  )
    .map(([tipo, valores]) => ({
      tipo,
      quantidade: valores.quantidade,
      custoEstimado: Math.round(valores.custoEstimado),
      potencialReducao: Math.round(valores.potencialReducao),
    }))
    .sort((a, b) => ordenarOportunidades(a, b));

  const principalDriver =
    porOportunidade.find((item) => item.custoEstimado > 0)?.tipo ??
    'Sem driver relevante';

  return {
    custoTotalProjetado: Math.round(custoTotalProjetado),
    receitaMensalCarteira: config.receitaMensalCarteira,
    sinistralidadeAtual,
    economiaPotencial: Math.round(economiaPotencial),
    sinistralidadeAjustada,
    gapMeta,
    faixa: classificarFaixa(
      sinistralidadeAtual,
      config.metaSinistralidade,
      config.faixaAtencao
    ),
    principalDriver,
    porRisco,
    porOportunidade,
  };
}
