import { beneficiariosMock } from '../../data/mock';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function findBeneficiaryByName(term: string) {
  const search = normalize(term);
  if (!search) return null;

  return (
    beneficiariosMock.find((item) => normalize(item.nome) === search) ??
    beneficiariosMock.find((item) => normalize(item.nome).includes(search))
  );
}

export function findBeneficiaryInMessage(message: string) {
  const normalized = normalize(message);
  return (
    beneficiariosMock.find((item) => normalized.includes(normalize(item.nome))) ?? null
  );
}

export function findAreaByName(term: string) {
  const search = normalize(term);
  if (!search) return null;

  const match = beneficiariosMock.find((item) => normalize(item.area) === search);
  return match?.area ?? null;
}

export function findAreaInMessage(message: string) {
  const normalized = normalize(message);
  const areas = [...new Set(beneficiariosMock.map((item) => item.area))];
  return areas.find((area) => normalized.includes(normalize(area))) ?? null;
}
