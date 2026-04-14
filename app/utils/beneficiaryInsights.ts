import type { Beneficiario, EspecialidadeAssistencial } from '../types';

export type TipoEventoDetalhado =
  | 'Consulta'
  | 'Pronto atendimento'
  | 'Exame'
  | 'Procedimento'
  | 'Internação';

export type EventoDetalhado = {
  data: string;
  tipo: TipoEventoDetalhado;
  nome: string;
  observacao: string;
  destaque?: string;
  diasAtrasReferencia?: number;
  especialidadeAssistencial?: EspecialidadeAssistencial;
};

export type DeclaracaoSaudeExpandida = {
  doencasPreexistentes: string[];
  lesoesCirurgias: string[];
  tratamentosContinuos: string[];
  internacoesExames: string[];
  habitosVidaDadosFisicos: string[];
  historicoFamiliar: string[];
};

function formatDate(date: Date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function daysAgoToDate(daysAgo: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function futureDate(daysAhead: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysAhead);
  return d;
}

function parsePtDate(value: string) {
  const [dia, mes, ano] = value.split('/').map(Number);
  return new Date(ano, mes - 1, dia, 12, 0, 0, 0);
}

export function getStatusEvento(dataEvento: string) {
  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12, 0, 0, 0);
  const data = parsePtDate(dataEvento);

  if (data.getTime() > hojeSemHora.getTime()) return 'Agendado';
  if (data.getTime() === hojeSemHora.getTime()) return 'Hoje';
  return 'Realizado';
}

export function sortTimeline(events: EventoDetalhado[]) {
  const ordemStatus = { Agendado: 0, Hoje: 1, Realizado: 2 };

  return [...events].sort((a, b) => {
    const statusA = getStatusEvento(a.data);
    const statusB = getStatusEvento(b.data);

    if (ordemStatus[statusA as keyof typeof ordemStatus] !== ordemStatus[statusB as keyof typeof ordemStatus]) {
      return ordemStatus[statusA as keyof typeof ordemStatus] - ordemStatus[statusB as keyof typeof ordemStatus];
    }

    const dateA = parsePtDate(a.data).getTime();
    const dateB = parsePtDate(b.data).getTime();

    if (statusA === 'Agendado' || statusA === 'Hoje') return dateA - dateB;
    return dateB - dateA;
  });
}

export function buildUnifiedTimeline(beneficiario: Beneficiario): EventoDetalhado[] {
  const timeline: EventoDetalhado[] = [];

  for (const evento of beneficiario.eventos) {
    const status = evento.status ?? 'Realizado';
    const dataBase =
      status === 'Agendado'
        ? formatDate(futureDate(Math.max(7, evento.diasAtras)))
        : formatDate(daysAgoToDate(evento.diasAtras));

    timeline.push({
      data: dataBase,
      tipo: evento.tipo,
      nome:
        evento.nome ??
        (evento.tipo === 'Consulta'
          ? 'Consulta clínica'
          : evento.tipo === 'Exame'
            ? 'Exame clínico'
            : evento.tipo === 'Pronto atendimento'
              ? 'Atendimento em pronto atendimento'
              : evento.tipo === 'Procedimento'
                ? 'Procedimento ambulatorial'
                : 'Internação clínica'),
      observacao:
        evento.tipo === 'Pronto atendimento'
          ? 'Alta no mesmo dia, sem necessidade de internação.'
          : evento.tipo === 'Internação'
            ? 'Evento hospitalar recente com alta registrada.'
            : evento.tipo === 'Procedimento'
              ? 'Procedimento registrado no histórico assistencial.'
              : 'Evento registrado no acompanhamento clínico.',
      destaque:
        evento.tipo === 'Pronto atendimento'
          ? 'Uso potencialmente evitável'
          : undefined,
      diasAtrasReferencia: status === 'Agendado' ? undefined : evento.diasAtras,
      especialidadeAssistencial: evento.especialidadeAssistencial,
    });
  }

  const examesRealizados = timeline
    .filter((item) => item.tipo === 'Exame' && getStatusEvento(item.data) === 'Realizado')
    .sort((a, b) => parsePtDate(a.data).getTime() - parsePtDate(b.data).getTime());

  for (let i = 0; i < examesRealizados.length - 1; i += 1) {
    const atual = examesRealizados[i];
    const proximo = examesRealizados[i + 1];
    const diferenca = Math.round(
      Math.abs(parsePtDate(atual.data).getTime() - parsePtDate(proximo.data).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (atual.nome === proximo.nome && diferenca <= 15) {
      atual.destaque = 'Possível redundância';
      proximo.destaque = 'Possível redundância';
    }
  }

  const hasFutureExam = timeline.some(
    (item) => getStatusEvento(item.data) === 'Agendado' && item.tipo === 'Exame'
  );
  const hasFutureConsulta = timeline.some(
    (item) => getStatusEvento(item.data) === 'Agendado' && item.tipo === 'Consulta'
  );

  if (!hasFutureExam && beneficiario.eventos.some((item) => item.tipo === 'Exame')) {
    timeline.push({
      data: formatDate(futureDate(45 + (beneficiario.id % 60))),
      tipo: 'Exame',
      nome: 'Exame de seguimento',
      observacao: 'Exame futuro programado para seguimento clínico.',
    });
  } else if (!hasFutureConsulta) {
    timeline.push({
      data: formatDate(futureDate(45 + (beneficiario.id % 60))),
      tipo: 'Consulta',
      nome: 'Consulta de reavaliação',
      observacao: 'Consulta futura agendada para reavaliação assistencial.',
    });
  }

  return sortTimeline(timeline);
}

function calcImc(pesoKg: number, alturaM: number) {
  return +(pesoKg / (alturaM * alturaM)).toFixed(1);
}

export function buildExpandedDeclaration(beneficiario: Beneficiario): DeclaracaoSaudeExpandida {
  const d = beneficiario.declaracao;
  const pesoKg = d.dadosFisicos?.pesoKg ?? 58 + ((beneficiario.id * 3) % 38);
  const alturaM = d.dadosFisicos?.alturaM ?? +(1.52 + ((beneficiario.id % 18) * 0.02)).toFixed(2);
  const imc = d.dadosFisicos?.imc ?? calcImc(pesoKg, alturaM);

  const doencasPreexistentes = [
    d.hipertensao ? 'Hipertensão' : null,
    d.diabetes ? 'Diabetes' : null,
    beneficiario.condicao.toLowerCase().includes('renal') ? 'Doença renal crônica' : null,
    beneficiario.condicao.toLowerCase().includes('obes') || imc >= 30 ? 'Obesidade' : null,
    beneficiario.condicao.toLowerCase().includes('respirat') ? 'Condição respiratória' : null,
    beneficiario.condicao.toLowerCase().includes('oncol') ? 'Histórico oncológico' : null,
  ].filter(Boolean) as string[];

  const lesoesCirurgias = [
    d.internacaoRecente ? 'Histórico de internação recente' : null,
    beneficiario.condicao.toLowerCase().includes('osteo') ? 'Queixa osteomuscular crônica' : null,
    beneficiario.id % 8 === 0 ? 'Cirurgia ortopédica prévia' : null,
  ].filter(Boolean) as string[];

  const tratamentosContinuos = [
    beneficiario.medicamentos.length > 0
      ? `Uso contínuo de ${beneficiario.medicamentos.slice(0, 3).map((m) => m.nome).join(', ')}`
      : null,
    beneficiario.medicamentos.length >= 5 ? 'Polifarmácia' : null,
    d.diabetes ? 'Acompanhamento metabólico regular' : null,
  ].filter(Boolean) as string[];

  const internacoesExames = [
    d.internacaoRecente ? 'Internação recente' : null,
    d.acompanhamentoRegular ? 'Acompanhamento médico regular' : 'Acompanhamento irregular',
    beneficiario.eventos.some((e) => e.tipo === 'Exame') ? 'Exames no histórico assistencial' : null,
    beneficiario.eventos.some((e) => e.tipo === 'Pronto atendimento') ? 'Passagem por pronto atendimento' : null,
  ].filter(Boolean) as string[];

  const habitosVidaDadosFisicos = [
    d.tabagismo ? 'Tabagismo' : null,
    d.alcoolFrequente ? 'Consumo frequente de álcool' : null,
    d.atividadeFisicaRegular ? 'Atividade física regular' : 'Baixa atividade física',
    `IMC estimado: ${imc}`,
    `Peso estimado: ${pesoKg} kg`,
    `Altura estimada: ${alturaM.toFixed(2)} m`,
  ].filter(Boolean) as string[];

  const historicoFamiliar = (d.historicoFamiliar?.condicoes ?? []).map((condicao) => {
    if (condicao === 'Doença cardiovascular') return 'Histórico familiar cardiovascular';
    if (condicao === 'Câncer') return 'Histórico familiar oncológico';
    if (condicao === 'Doença renal crônica') return 'Histórico familiar de doença renal crônica';
    if (condicao === 'Doença respiratória crônica') return 'Histórico familiar respiratório';
    if (condicao === 'Doença neurológica degenerativa') return 'Histórico familiar neurológico degenerativo';
    if (condicao === 'Hipertensão') return 'Histórico familiar de hipertensão';
    return 'Histórico familiar de diabetes';
  });

  return {
    doencasPreexistentes,
    lesoesCirurgias,
    tratamentosContinuos,
    internacoesExames,
    habitosVidaDadosFisicos,
    historicoFamiliar,
  };
}