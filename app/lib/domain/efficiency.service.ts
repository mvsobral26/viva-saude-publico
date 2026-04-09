import { beneficiariosMock } from '../../data/mock';
import {
  listarOportunidadesEficiencia,
  obterResumoOportunidade,
  type TipoOportunidade,
} from '../../utils/efficiency';

export type { TipoOportunidade } from '../../utils/efficiency';

export function listEfficiencyOpportunities() {
  return listarOportunidadesEficiencia(beneficiariosMock);
}

export function listOpportunitiesByType(tipo: TipoOportunidade) {
  return listarOportunidadesEficiencia(beneficiariosMock).filter((item) => item.tipo === tipo);
}

export function listRedundancyCases() {
  return listOpportunitiesByType('Exame com possível redundância');
}

export function listRepetitionCases() {
  return listOpportunitiesByType('Repetição assistencial');
}

export function getOpportunitySummaryByBeneficiary(id: number) {
  const beneficiario = beneficiariosMock.find((item) => item.id === id);
  if (!beneficiario) return null;
  return obterResumoOportunidade(beneficiario);
}
