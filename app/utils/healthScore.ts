import type { Beneficiario, DeclaracaoSaude, Risco } from '../types';

type BeneficiarioParaScore = Omit<Beneficiario, 'score' | 'risco'>;

type DoencasPreexistentesNormalizadas = {
  hipertensao: boolean;
  diabetes: boolean;
  obesidade: boolean;
  cardiopatia: boolean;
  insuficienciaCardiaca: boolean;
  arritmia: boolean;
  asma: boolean;
  bronquite: boolean;
  dpoc: boolean;
  doencaRenalCronica: boolean;
  historicoOncologico: boolean;
  tumorBenigno: boolean;
  parkinson: boolean;
  alzheimer: boolean;
  epilepsia: boolean;
  depressao: boolean;
  ansiedade: boolean;
  doencaAutoimune: boolean;
  hiv: boolean;
  herniaDeDisco: boolean;
  artrose: boolean;
  artrite: boolean;
  osteoporose: boolean;
};

type HabitosVidaNormalizados = {
  fumante: boolean;
  consumoAlcoolFrequente: boolean;
  atividadeFisicaRegular: boolean;
  alimentacaoEquilibrada: boolean;
  sonoAdequado: boolean;
  estresseElevado: boolean;
};

type TratamentosContinuosNormalizados = {
  usaMedicacaoContinua: boolean;
  polifarmacia: boolean;
  insulinoterapia: boolean;
  anticoagulante: boolean;
  imunossupressor: boolean;
  tratamentoOncologicoAtual: boolean;
};

type InternacoesExamesNormalizados = {
  internacaoUltimos12Meses: boolean;
  internacaoUltimos30Dias: boolean;
  utiPrevia: boolean;
  prontoAtendimentoRecorrente: boolean;
  exameComplexoRecente: boolean;
  tomografiaRecente: boolean;
  ressonanciaRecente: boolean;
  biopsiaRecente: boolean;
  acompanhamentoMedicoAtual: boolean;
};

type PercepcaoSaudeNormalizada = {
  dorCronica: boolean;
  limitacaoMobilidade: boolean;
  fadigaRecorrente: boolean;
  autoavaliacaoSaude: 'Ótima' | 'Boa' | 'Regular' | 'Ruim';
};

function limitarScore(valor: number) {
  return Math.max(0, Math.min(100, valor));
}

function contemCondicaoCritica(condicao: string) {
  return /cardio|cardiovascular|renal|diabetes|insuficiência|oncolog|dpoc|metabólic|autoimune|alzheimer|parkinson/i.test(
    condicao
  );
}

function usaMedicacaoCritica(beneficiario: Pick<Beneficiario, 'medicamentos'>) {
  const nomes = beneficiario.medicamentos.map((m) => m.nome.toLowerCase());

  return nomes.some((nome) =>
    [
      'losartana',
      'metformina',
      'insulina',
      'sinvastatina',
      'rosuvastatina',
      'aas',
      'varfarina',
      'rivaroxabana',
      'sertralina',
      'prednisona',
    ].some((critico) => nome.includes(critico))
  );
}

function teveProntoAtendimentoRecente(beneficiario: Pick<Beneficiario, 'eventos'>) {
  return beneficiario.eventos.some(
    (evento) => evento.tipo === 'Pronto atendimento' && evento.diasAtras <= 60
  );
}

function teveInternacaoRecente(beneficiario: Pick<Beneficiario, 'declaracao' | 'eventos'>) {
  return (
    beneficiario.declaracao.internacaoRecente ||
    beneficiario.eventos.some(
      (evento) => evento.tipo === 'Internação' && evento.diasAtras <= 120
    )
  );
}

function normalizarDoencasPreexistentes(declaracao: DeclaracaoSaude): DoencasPreexistentesNormalizadas {
  const d = declaracao.doencasPreexistentes;

  return {
    hipertensao: d?.hipertensao ?? declaracao.hipertensao ?? false,
    diabetes: d?.diabetes ?? declaracao.diabetes ?? false,
    obesidade: d?.obesidade ?? /obesidade/i.test((declaracao as { condicao?: string }).condicao ?? ''),
    cardiopatia: d?.cardiopatia ?? false,
    insuficienciaCardiaca: d?.insuficienciaCardiaca ?? false,
    arritmia: d?.arritmia ?? false,
    asma: d?.asma ?? false,
    bronquite: d?.bronquite ?? false,
    dpoc: d?.dpoc ?? false,
    doencaRenalCronica: d?.doencaRenalCronica ?? false,
    historicoOncologico: d?.historicoOncologico ?? false,
    tumorBenigno: d?.tumorBenigno ?? false,
    parkinson: d?.parkinson ?? false,
    alzheimer: d?.alzheimer ?? false,
    epilepsia: d?.epilepsia ?? false,
    depressao: d?.depressao ?? false,
    ansiedade: d?.ansiedade ?? false,
    doencaAutoimune: d?.doencaAutoimune ?? false,
    hiv: d?.hiv ?? false,
    herniaDeDisco: d?.herniaDeDisco ?? false,
    artrose: d?.artrose ?? false,
    artrite: d?.artrite ?? false,
    osteoporose: d?.osteoporose ?? false,
  };
}

function normalizarHabitosVida(declaracao: DeclaracaoSaude): HabitosVidaNormalizados {
  const h = declaracao.habitosVida;

  return {
    fumante: h?.fumante ?? h?.tabagismo ?? declaracao.tabagismo ?? false,
    consumoAlcoolFrequente:
      h?.consumoAlcoolFrequente ?? h?.alcoolFrequente ?? declaracao.alcoolFrequente ?? false,
    atividadeFisicaRegular: h?.atividadeFisicaRegular ?? declaracao.atividadeFisicaRegular ?? false,
    alimentacaoEquilibrada: h?.alimentacaoEquilibrada ?? true,
    sonoAdequado: h?.sonoAdequado ?? true,
    estresseElevado: h?.estresseElevado ?? false,
  };
}

function normalizarTratamentosContinuos(
  declaracao: DeclaracaoSaude,
  beneficiario: Pick<Beneficiario, 'medicamentos'>
): TratamentosContinuosNormalizados {
  const t = declaracao.tratamentosContinuos;
  const nomes = beneficiario.medicamentos.map((m) => m.nome.toLowerCase());
  const quantidade = beneficiario.medicamentos.length;

  return {
    usaMedicacaoContinua: t?.usaMedicacaoContinua ?? quantidade > 0,
    polifarmacia: t?.polifarmacia ?? quantidade >= 5,
    insulinoterapia: t?.insulinoterapia ?? nomes.some((nome) => nome.includes('insulina')),
    anticoagulante:
      t?.anticoagulante ?? nomes.some((nome) => nome.includes('varfarina') || nome.includes('rivaroxabana')),
    imunossupressor: t?.imunossupressor ?? nomes.some((nome) => nome.includes('prednisona')),
    tratamentoOncologicoAtual: t?.tratamentoOncologicoAtual ?? false,
  };
}

function normalizarInternacoesExames(
  declaracao: DeclaracaoSaude,
  beneficiario: Pick<Beneficiario, 'eventos'>
): InternacoesExamesNormalizados {
  const i = declaracao.internacoesExames;
  const houveInternacao12Meses =
    i?.internacaoUltimos12Meses ?? declaracao.internacaoRecente ?? beneficiario.eventos.some((e) => e.tipo === 'Internação' && e.diasAtras <= 365);
  const houveInternacao30Dias =
    i?.internacaoUltimos30Dias ?? beneficiario.eventos.some((e) => e.tipo === 'Internação' && e.diasAtras <= 30);
  const prontoAtendimentoRecorrente =
    i?.prontoAtendimentoRecorrente ??
    beneficiario.eventos.filter((e) => e.tipo === 'Pronto atendimento' && e.diasAtras <= 60).length >= 2;
  const exameRecente =
    i?.exameComplexoRecente ?? beneficiario.eventos.some((e) => e.tipo === 'Exame' && e.diasAtras <= 60);

  return {
    internacaoUltimos12Meses: houveInternacao12Meses,
    internacaoUltimos30Dias: houveInternacao30Dias,
    utiPrevia: i?.utiPrevia ?? false,
    prontoAtendimentoRecorrente,
    exameComplexoRecente: exameRecente,
    tomografiaRecente: i?.tomografiaRecente ?? false,
    ressonanciaRecente: i?.ressonanciaRecente ?? false,
    biopsiaRecente: i?.biopsiaRecente ?? false,
    acompanhamentoMedicoAtual: i?.acompanhamentoMedicoAtual ?? declaracao.acompanhamentoRegular ?? true,
  };
}

function normalizarPercepcaoSaude(declaracao: DeclaracaoSaude): PercepcaoSaudeNormalizada {
  const p = declaracao.percepcaoSaude;

  return {
    dorCronica: p?.dorCronica ?? false,
    limitacaoMobilidade: p?.limitacaoMobilidade ?? false,
    fadigaRecorrente: p?.fadigaRecorrente ?? false,
    autoavaliacaoSaude: p?.autoavaliacaoSaude ?? 'Boa',
  };
}

function calcularPesoComorbidades(declaracao: DeclaracaoSaude) {
  const d = normalizarDoencasPreexistentes(declaracao);
  let score = 0;

  if (d.hipertensao) score += 6;
  if (d.diabetes) score += 8;
  if (d.cardiopatia || d.insuficienciaCardiaca || d.arritmia) score += 9;
  if (d.asma || d.bronquite || d.dpoc) score += 5;
  if (d.obesidade) score += 6;
  if (d.doencaRenalCronica) score += 8;
  if (d.historicoOncologico || d.tumorBenigno) score += 6;
  if (d.parkinson || d.alzheimer || d.epilepsia) score += 7;
  if (d.depressao || d.ansiedade) score += 4;
  if (d.doencaAutoimune || d.hiv) score += 6;
  if (d.herniaDeDisco || d.artrose || d.artrite || d.osteoporose) score += 4;

  return score;
}

function calcularPesoHabitos(declaracao: DeclaracaoSaude) {
  const h = normalizarHabitosVida(declaracao);
  const imc = declaracao.dadosFisicos?.imc ?? null;
  let score = 0;

  if (h.fumante) score += 7;
  if (h.consumoAlcoolFrequente) score += 4;
  if (!h.atividadeFisicaRegular) score += 5;
  if (!h.alimentacaoEquilibrada) score += 3;
  if (!h.sonoAdequado) score += 2;
  if (h.estresseElevado) score += 3;

  if (typeof imc === 'number') {
    if (imc >= 35) score += 8;
    else if (imc >= 30) score += 6;
    else if (imc >= 25) score += 3;
  }

  return score;
}

function calcularPesoUsoAssistencial(declaracao: DeclaracaoSaude, beneficiario: BeneficiarioParaScore) {
  const t = normalizarTratamentosContinuos(declaracao, beneficiario);
  const i = normalizarInternacoesExames(declaracao, beneficiario);
  const p = normalizarPercepcaoSaude(declaracao);
  let score = 0;

  if (t.usaMedicacaoContinua) score += 3;
  if (t.polifarmacia) score += 6;
  if (t.insulinoterapia || t.anticoagulante || t.imunossupressor) score += 5;
  if (t.tratamentoOncologicoAtual) score += 8;
  if (!beneficiario.declaracao.acompanhamentoRegular) score += 8;
  if (i.internacaoUltimos12Meses) score += 8;
  if (i.internacaoUltimos30Dias) score += 10;
  if (i.utiPrevia) score += 6;
  if (i.prontoAtendimentoRecorrente) score += 6;
  if (i.exameComplexoRecente || i.tomografiaRecente || i.ressonanciaRecente || i.biopsiaRecente) score += 4;
  if (!i.acompanhamentoMedicoAtual) score += 4;
  if (p.dorCronica) score += 3;
  if (p.limitacaoMobilidade) score += 4;
  if (p.fadigaRecorrente) score += 3;
  if (p.autoavaliacaoSaude === 'Ruim') score += 6;
  else if (p.autoavaliacaoSaude === 'Regular') score += 3;

  return score;
}

export function calcularHealthScore(beneficiario: BeneficiarioParaScore) {
  let score = 0;

  const { declaracao, custoPotencial30d, ultimoEventoDias, condicao, medicamentos } = beneficiario;
  const doencas = normalizarDoencasPreexistentes(declaracao);

  score += calcularPesoComorbidades(declaracao);
  score += calcularPesoHabitos(declaracao);
  score += calcularPesoUsoAssistencial(declaracao, beneficiario);

  if (medicamentos.length >= 1 && medicamentos.length <= 2) score += 3;
  if (medicamentos.length >= 3 && medicamentos.length <= 4) score += 7;
  if (medicamentos.length >= 5) score += 11;
  if (usaMedicacaoCritica(beneficiario)) score += 3;

  if (ultimoEventoDias > 180) score += 14;
  else if (ultimoEventoDias > 90) score += 9;
  else if (ultimoEventoDias > 30) score += 4;

  if (teveProntoAtendimentoRecente(beneficiario)) score += 8;
  if (teveInternacaoRecente(beneficiario)) score += 10;

  if (custoPotencial30d <= 3000) score += 2;
  else if (custoPotencial30d <= 8000) score += 6;
  else if (custoPotencial30d <= 15000) score += 10;
  else score += 15;

  if (doencas.diabetes && doencas.hipertensao) score += 5;
  if (declaracao.tabagismo && /cardio|cardiovascular/i.test(condicao)) score += 5;
  if (!declaracao.acompanhamentoRegular && ultimoEventoDias > 90) score += 6;
  if (teveInternacaoRecente(beneficiario) && medicamentos.length >= 5) score += 8;
  if (contemCondicaoCritica(condicao)) score += 4;

  return limitarScore(score);
}

export function classificarRisco(score: number): Risco {
  if (score >= 70) return 'Alto';
  if (score >= 40) return 'Médio';
  return 'Baixo';
}

export function gerarResumoScore(
  beneficiario: Pick<Beneficiario, 'declaracao' | 'ultimoEventoDias' | 'custoPotencial30d' | 'score' | 'condicao' | 'eventos' | 'medicamentos'>,
  score: number
) {
  const motivos: string[] = [];
  const d = normalizarDoencasPreexistentes(beneficiario.declaracao);

  if (d.diabetes) motivos.push('diabetes');
  if (d.hipertensao) motivos.push('hipertensão');
  if (beneficiario.declaracao.tabagismo) motivos.push('tabagismo');
  if (d.obesidade) motivos.push('obesidade');
  if (!beneficiario.declaracao.acompanhamentoRegular) motivos.push('ausência de acompanhamento regular');
  if (beneficiario.ultimoEventoDias > 90) motivos.push('longo intervalo sem revisão');
  if (beneficiario.custoPotencial30d > 8000) motivos.push('alto custo potencial');
  if (teveInternacaoRecente(beneficiario)) motivos.push('internação recente');

  if (motivos.length === 0) {
    return `Health Score ${score}: perfil com baixa criticidade atual e foco em prevenção.`;
  }

  return `Health Score ${score}: priorizado por ${motivos.slice(0, 3).join(', ')}.`;
}
