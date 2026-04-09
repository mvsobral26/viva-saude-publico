import { beneficiariosMock } from '../../data/mock';
import { gerarAlertas } from '../../utils/alerts';

export function getAlertsByBeneficiary(id: number) {
  const beneficiario = beneficiariosMock.find((item) => item.id === id);
  if (!beneficiario) return [];
  return gerarAlertas(beneficiario);
}

export function listCriticalAlerts(limit = 5) {
  return beneficiariosMock
    .map((item) => ({
      beneficiario: item,
      alertas: gerarAlertas(item),
    }))
    .filter((entry) => entry.alertas.some((alerta) => alerta.tipo === 'Crítico'))
    .sort((a, b) => b.beneficiario.score - a.beneficiario.score)
    .slice(0, limit);
}
