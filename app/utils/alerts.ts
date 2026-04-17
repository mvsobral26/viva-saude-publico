export type TipoAlerta = 'Crítico' | 'Alto' | 'Médio' | 'Baixo';

export type AlertaGerado = {
  tipo: TipoAlerta;
  mensagem: string;
};

type BeneficiarioLike = {
  score?: number;
  risco?: 'Alto' | 'Médio' | 'Baixo';
  custoPotencial30d?: number;
  ultimoEventoDias?: number;
  declaracao?: {
    diabetes?: boolean;
    hipertensao?: boolean;
    atividadeFisicaRegular?: boolean;
    acompanhamentoRegular?: boolean;
    doencasPreexistentes?: {
      obesidade?: boolean;
      cardiopatia?: boolean;
      insuficienciaCardiaca?: boolean;
      doencaRenalCronica?: boolean;
      dpoc?: boolean;
      historicoOncologico?: boolean;
      depressao?: boolean;
      ansiedade?: boolean;
    };
    tratamentosContinuos?: {
      polifarmacia?: boolean;
      tratamentoOncologicoAtual?: boolean;
      insulinoterapia?: boolean;
      anticoagulante?: boolean;
      imunossupressor?: boolean;
    };
    internacoesExames?: {
      internacaoUltimos30Dias?: boolean;
      prontoAtendimentoRecorrente?: boolean;
      exameComplexoRecente?: boolean;
      acompanhamentoMedicoAtual?: boolean;
    };
    dadosFisicos?: { imc?: number };
    habitosVida?: { fumante?: boolean; estresseElevado?: boolean };
    percepcaoSaude?: { dorCronica?: boolean; limitacaoMobilidade?: boolean };
  };
  medicamentos?: Array<unknown>;
  eventos?: Array<{ tipo?: string; diasAtras?: number }>;
};

function temEventoRecente(beneficiario: BeneficiarioLike, termos: string[], limiteDias = 30) {
  return (beneficiario.eventos ?? []).some((evento) => {
    const tipo = (evento.tipo ?? '').toLowerCase();
    const diasAtras = evento.diasAtras ?? 9999;
    return termos.some((termo) => tipo.includes(termo.toLowerCase())) && diasAtras <= limiteDias;
  });
}

function adicionar(alertas: AlertaGerado[], tipo: TipoAlerta, mensagem: string) {
  const existe = alertas.some((alerta) => alerta.mensagem === mensagem);
  if (!existe) alertas.push({ tipo, mensagem });
}

export function gerarAlertas(beneficiario: BeneficiarioLike): AlertaGerado[] {
  const alertas: AlertaGerado[] = [];
  const custoPotencial30d = beneficiario.custoPotencial30d ?? 0;
  const ultimoEventoDias = beneficiario.ultimoEventoDias ?? 9999;
  const quantidadeMedicamentos = (beneficiario.medicamentos ?? []).length;
  const risco = beneficiario.risco ?? 'Baixo';
  const score = beneficiario.score ?? 0;

  const declaracao = beneficiario.declaracao;
  const diabetes = declaracao?.diabetes === true;
  const hipertensao = declaracao?.hipertensao === true;
  const atividadeFisicaRegular = declaracao?.atividadeFisicaRegular;
  const acompanhamentoRegular = declaracao?.acompanhamentoRegular;
  const obesidade = declaracao?.doencasPreexistentes?.obesidade === true;
  const cardiopatia =
    declaracao?.doencasPreexistentes?.cardiopatia === true ||
    declaracao?.doencasPreexistentes?.insuficienciaCardiaca === true;
  const doencaRenal = declaracao?.doencasPreexistentes?.doencaRenalCronica === true;
  const dpoc = declaracao?.doencasPreexistentes?.dpoc === true;
  const historicoOncologico = declaracao?.doencasPreexistentes?.historicoOncologico === true;
  const saudeMental =
    declaracao?.doencasPreexistentes?.depressao === true ||
    declaracao?.doencasPreexistentes?.ansiedade === true;
  const polifarmacia =
    declaracao?.tratamentosContinuos?.polifarmacia === true || quantidadeMedicamentos >= 5;
  const tratamentoOncologicoAtual =
    declaracao?.tratamentosContinuos?.tratamentoOncologicoAtual === true;
  const insulinoterapia = declaracao?.tratamentosContinuos?.insulinoterapia === true;
  const anticoagulante = declaracao?.tratamentosContinuos?.anticoagulante === true;
  const imunossupressor = declaracao?.tratamentosContinuos?.imunossupressor === true;
  const internacaoUltimos30Dias = declaracao?.internacoesExames?.internacaoUltimos30Dias === true;
  const prontoAtendimentoRecorrente =
    declaracao?.internacoesExames?.prontoAtendimentoRecorrente === true;
  const exameComplexoRecente = declaracao?.internacoesExames?.exameComplexoRecente === true;
  const acompanhamentoMedicoAtual = declaracao?.internacoesExames?.acompanhamentoMedicoAtual;
  const imc = declaracao?.dadosFisicos?.imc ?? 0;
  const fumante = declaracao?.habitosVida?.fumante === true;
  const estresseElevado = declaracao?.habitosVida?.estresseElevado === true;
  const dorCronica = declaracao?.percepcaoSaude?.dorCronica === true;
  const limitacaoMobilidade = declaracao?.percepcaoSaude?.limitacaoMobilidade === true;

  const teveInternacaoRecente =
    internacaoUltimos30Dias || temEventoRecente(beneficiario, ['internação', 'internacao'], 60);
  const teveProntoAtendimentoRecente =
    prontoAtendimentoRecorrente ||
    temEventoRecente(
      beneficiario,
      ['pronto atendimento', 'pronto-atendimento', 'pa', 'emergência', 'emergencia'],
      45
    );

  const temCondicaoCronicaRelevante =
    diabetes || hipertensao || cardiopatia || doencaRenal || dpoc || historicoOncologico;
  const temDescontinuidadeAssistencial =
    acompanhamentoRegular === false || acompanhamentoMedicoAtual === false || ultimoEventoDias > 180;
  const fragilidadeClinicaAlta =
    risco === 'Alto' ||
    score >= 75 ||
    teveInternacaoRecente ||
    (teveProntoAtendimentoRecente && temCondicaoCronicaRelevante);
  const vigilanciaElevada = insulinoterapia || anticoagulante || imunossupressor;

  if (custoPotencial30d >= 20000 && fragilidadeClinicaAlta) {
    adicionar(alertas, 'Crítico', 'Alto custo potencial no curto prazo');
  } else if (
    custoPotencial30d >= 16000 &&
    (risco === 'Alto' || teveInternacaoRecente || teveProntoAtendimentoRecente)
  ) {
    adicionar(alertas, 'Alto', 'Alto custo potencial no curto prazo');
  } else if (custoPotencial30d >= 12000 && (temCondicaoCronicaRelevante || risco !== 'Baixo')) {
    adicionar(alertas, 'Médio', 'Custo potencial elevado no curto prazo');
  }

  if (diabetes && acompanhamentoRegular === false) {
    adicionar(
      alertas,
      insulinoterapia || fragilidadeClinicaAlta ? 'Crítico' : 'Alto',
      'Diabetes sem acompanhamento regular'
    );
  }

  if (hipertensao && acompanhamentoRegular === false) {
    adicionar(
      alertas,
      cardiopatia || risco === 'Alto' || teveProntoAtendimentoRecente ? 'Alto' : 'Médio',
      'Hipertensão sem acompanhamento regular'
    );
  }

  if (teveInternacaoRecente && polifarmacia) {
    adicionar(alertas, 'Crítico', 'Internação recente com polifarmácia');
  }

  if (acompanhamentoRegular === false && ultimoEventoDias > 120) {
    adicionar(
      alertas,
      risco === 'Alto' || teveInternacaoRecente || cardiopatia || doencaRenal ? 'Alto' : 'Médio',
      'Possível abandono de acompanhamento'
    );
  }

  if (
    atividadeFisicaRegular === false &&
    (risco !== 'Baixo' || acompanhamentoRegular === false)
  ) {
    adicionar(alertas, 'Baixo', 'Sedentarismo declarado');
  }

  if (ultimoEventoDias > 180) {
    adicionar(
      alertas,
      fragilidadeClinicaAlta || temCondicaoCronicaRelevante ? 'Alto' : 'Médio',
      'Sem consulta há mais de 180 dias'
    );
  }

  if (
    polifarmacia &&
    (acompanhamentoRegular === false || risco === 'Alto' || teveInternacaoRecente)
  ) {
    adicionar(alertas, 'Médio', 'Uso contínuo de múltiplos medicamentos');
  }

  if (teveProntoAtendimentoRecente) {
    adicionar(
      alertas,
      risco === 'Alto' || cardiopatia || doencaRenal || teveInternacaoRecente ? 'Alto' : 'Médio',
      'Uso recente de pronto atendimento'
    );
  }

  if (
    (obesidade || imc >= 30) &&
    (atividadeFisicaRegular === false || acompanhamentoRegular === false)
  ) {
    adicionar(alertas, 'Médio', 'Obesidade / IMC elevado');
  }

  if (cardiopatia) {
    adicionar(
      alertas,
      temDescontinuidadeAssistencial || teveProntoAtendimentoRecente || score >= 75 ? 'Alto' : 'Médio',
      'Condição cardiovascular crônica'
    );
  }

  if (doencaRenal) {
    adicionar(
      alertas,
      temDescontinuidadeAssistencial || fragilidadeClinicaAlta ? 'Alto' : 'Médio',
      'Doença renal com necessidade de monitoramento'
    );
  }

  if (dpoc && fumante) {
    adicionar(
      alertas,
      teveProntoAtendimentoRecente || teveInternacaoRecente || risco === 'Alto' ? 'Alto' : 'Médio',
      'Doença respiratória associada a fator de risco'
    );
  }

  if (historicoOncologico && (tratamentoOncologicoAtual || exameComplexoRecente)) {
    adicionar(alertas, 'Crítico', 'Oncologia em acompanhamento ativo');
  }

  if (vigilanciaElevada) {
    adicionar(alertas, 'Médio', 'Tratamento contínuo de alta vigilância');
  }

  if (saudeMental && estresseElevado) {
    adicionar(alertas, 'Médio', 'Saúde mental com fator agravante');
  }

  if (dorCronica || limitacaoMobilidade) {
    adicionar(alertas, 'Médio', 'Impacto funcional relevante');
  }

  if (acompanhamentoMedicoAtual === false && score >= 60) {
    adicionar(
      alertas,
      score >= 75 || risco === 'Alto' || temCondicaoCronicaRelevante ? 'Alto' : 'Médio',
      'Alto risco sem seguimento médico atual'
    );
  }

  if (alertas.length === 0 && (risco === 'Baixo' || score <= 45)) {
    adicionar(alertas, 'Baixo', 'Perfil estável, manter prevenção');
  }

  return alertas;
}
