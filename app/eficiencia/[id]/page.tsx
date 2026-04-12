'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Badge, {
  getClinicalTagVariant,
  getEfficiencyBadgeVariant,
  getEventBadgeVariant,
  getRiskBadgeVariant,
  getStatusBadgeVariant,
} from '../../components/Badge';
import { beneficiariosMock } from '../../data/mock';
import {
  buildUnifiedTimeline,
  getStatusEvento,
  type EventoDetalhado,
} from '../../utils/beneficiaryInsights';
import { obterEventosCoincidentesRepeticao, obterResumoOportunidade } from '../../utils/efficiency';

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function getEventBadgeVariantSeguro(tipo: EventoDetalhado['tipo']) {
  if (tipo === 'Internação') {
    return getEventBadgeVariant('Procedimento');
  }
  return getEventBadgeVariant(tipo);
}

export default function EficienciaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');

  const beneficiario = useMemo(
    () => beneficiariosMock.find((item) => String(item.id) === id),
    [id]
  );

  const timeline = useMemo(
    () => (beneficiario ? buildUnifiedTimeline(beneficiario) : []),
    [beneficiario]
  );

  const resumo = useMemo(
    () => (beneficiario ? obterResumoOportunidade(beneficiario) : null),
    [beneficiario]
  );

  const eventosCoincidentesRepeticao = useMemo(
    () => (beneficiario ? obterEventosCoincidentesRepeticao(beneficiario) : []),
    [beneficiario]
  );

  const totais = useMemo(
    () => ({
      consultas: beneficiario?.eventos.filter((item) => item.tipo === 'Consulta').length ?? 0,
      pa: beneficiario?.eventos.filter((item) => item.tipo === 'Pronto atendimento').length ?? 0,
      exames: beneficiario?.eventos.filter((item) => item.tipo === 'Exame').length ?? 0,
      procedimentos: beneficiario?.eventos.filter((item) => item.tipo === 'Procedimento').length ?? 0,
    }),
    [beneficiario]
  );

  if (!beneficiario || !resumo) {
    return (
      <AppShell active="eficiencia">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Beneficiário sem oportunidade identificada
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Este beneficiário não está classificado com oportunidade ativa no módulo de
            Eficiência Assistencial.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="eficiencia">
      <div className="flex flex-col gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/eficiencia')}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Voltar para Eficiência Assistencial
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/beneficiarios/${beneficiario.id}`)}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Detalhes do beneficiário
                </button>
              </div>

              <p className="mt-5 text-sm font-medium text-emerald-600">
                Detalhe da oportunidade
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {beneficiario.nome}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Histórico assistencial detalhado com consultas, pronto atendimento, exames e
                procedimentos, usando a mesma base do detalhe clínico.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>
                  {beneficiario.risco}
                </Badge>
                <Badge variant={getEfficiencyBadgeVariant(resumo.tipo)}>
                  {resumo.tipo}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[820px]">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Score
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {beneficiario.score}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Custo estimado
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {moeda(resumo.custo)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Potencial de otimização
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {resumo.potencialOtimizacao}%
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Consultas</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.consultas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pronto atendimento</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.pa}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Exames</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.exames}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Procedimentos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.procedimentos}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Leitura da IA</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Síntese do caso</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">{resumo.justificativa}</p>
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Ação sugerida
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{resumo.acao}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Histórico assistencial</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Linha do tempo</h2>
            <div className="mt-5 flex flex-col gap-4">
              {timeline.map((evento, index) => {
                const status = getStatusEvento(evento.data);
                const isEventoCoincidente =
                  resumo.tipo === 'Repetição assistencial' &&
                  evento.diasAtrasReferencia !== undefined &&
                  eventosCoincidentesRepeticao.some(
                    (item) =>
                      item.tipo === evento.tipo &&
                      item.nome === evento.nome &&
                      item.diasAtras === evento.diasAtrasReferencia
                  );

                return (
                  <div
                    key={`${evento.data}-${evento.nome}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getEventBadgeVariantSeguro(evento.tipo)}>
                        {evento.tipo}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {evento.data}
                      </span>
                      {isEventoCoincidente && evento.especialidadeAssistencial ? (
                        <Badge variant="neutral">{evento.especialidadeAssistencial}</Badge>
                      ) : null}
                      {evento.destaque ? (
                        <Badge variant={getClinicalTagVariant(evento.destaque)}>
                          {evento.destaque}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {evento.nome}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{evento.observacao}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}