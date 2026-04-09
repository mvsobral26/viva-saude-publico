import { beneficiariosMock } from '../../data/mock';
import { gerarAlertas } from '../../utils/alerts';
import { buildUnifiedTimeline } from '../../utils/beneficiaryInsights';
import {
  identificarOportunidadeEficiencia,
  obterResumoOportunidade,
} from '../../utils/efficiency';
import { gerarResumoScore } from '../../utils/healthScore';

export function getBeneficiaryById(id: number) {
  return beneficiariosMock.find((item) => item.id === id) ?? null;
}

export function getBeneficiarySummary(id: number) {
  const beneficiario = getBeneficiaryById(id);
  if (!beneficiario) return null;

  const alertas = gerarAlertas(beneficiario);
  const oportunidades = identificarOportunidadeEficiencia(beneficiario);
  const timeline = buildUnifiedTimeline(beneficiario).slice(0, 4);
  const resumoOportunidade = obterResumoOportunidade(beneficiario);

  return {
    beneficiario,
    alertas,
    oportunidades,
    timeline,
    resumoOportunidade,
  };
}

export function getBeneficiaryScoreExplanation(id: number) {
  const beneficiario = getBeneficiaryById(id);
  if (!beneficiario) return null;

  return {
    beneficiario,
    resumoScore: gerarResumoScore(beneficiario, beneficiario.score),
    alertas: gerarAlertas(beneficiario),
    oportunidade: obterResumoOportunidade(beneficiario),
  };
}