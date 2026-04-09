import { beneficiariosMock } from '../../data/mock';
import type { Beneficiario } from '../../types';

export type DashboardSummary = {
  totalBeneficiarios: number;
  custoPotencialTotal: number;
  scoreMedio: number;
  semAcompanhamento: number;
};

function isSemAcompanhamento(beneficiario: Beneficiario) {
  return (
    beneficiario.status.toLowerCase().includes('sem acompanhamento') ||
    !beneficiario.declaracao.acompanhamentoRegular ||
    beneficiario.ultimoEventoDias > 90
  );
}

export function getDashboardSummary(): DashboardSummary {
  const totalBeneficiarios = beneficiariosMock.length;
  const custoPotencialTotal = beneficiariosMock.reduce(
    (acc, item) => acc + item.custoPotencial30d,
    0
  );
  const scoreMedio =
    totalBeneficiarios > 0
      ? Math.round(
          beneficiariosMock.reduce((acc, item) => acc + item.score, 0) / totalBeneficiarios
        )
      : 0;

  return {
    totalBeneficiarios,
    custoPotencialTotal,
    scoreMedio,
    semAcompanhamento: beneficiariosMock.filter(isSemAcompanhamento).length,
  };
}

export function getRiskDistribution() {
  return {
    alto: beneficiariosMock.filter((item) => item.risco === 'Alto').length,
    medio: beneficiariosMock.filter((item) => item.risco === 'Médio').length,
    baixo: beneficiariosMock.filter((item) => item.risco === 'Baixo').length,
  };
}

export function getTopCriticalCases(limit = 5) {
  return [...beneficiariosMock].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getPriorityAreas(limit = 5) {
  const mapa = new Map<
    string,
    { area: string; total: number; altoRisco: number; scoreTotal: number; custoTotal: number }
  >();

  beneficiariosMock.forEach((item) => {
    const atual = mapa.get(item.area) ?? {
      area: item.area,
      total: 0,
      altoRisco: 0,
      scoreTotal: 0,
      custoTotal: 0,
    };

    atual.total += 1;
    atual.scoreTotal += item.score;
    atual.custoTotal += item.custoPotencial30d;
    if (item.risco === 'Alto') atual.altoRisco += 1;

    mapa.set(item.area, atual);
  });

  return Array.from(mapa.values())
    .map((item) => ({
      ...item,
      scoreMedio: Math.round(item.scoreTotal / item.total),
    }))
    .sort((a, b) => {
      if (b.altoRisco !== a.altoRisco) return b.altoRisco - a.altoRisco;
      return b.scoreMedio - a.scoreMedio;
    })
    .slice(0, limit);
}

export function getAreaSummary(area: string) {
  const base = beneficiariosMock.filter(
    (item) => item.area.toLowerCase() === area.toLowerCase().trim()
  );

  if (base.length === 0) return null;

  const alto = base.filter((item) => item.risco === 'Alto').length;
  const scoreMedio = Math.round(base.reduce((acc, item) => acc + item.score, 0) / base.length);
  const custoTotal = base.reduce((acc, item) => acc + item.custoPotencial30d, 0);
  const semAcompanhamento = base.filter(isSemAcompanhamento).length;

  return {
    area: base[0].area,
    total: base.length,
    alto,
    scoreMedio,
    custoTotal,
    semAcompanhamento,
    topCasos: [...base].sort((a, b) => b.score - a.score).slice(0, 3),
  };
}
