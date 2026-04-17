'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import Badge, {
  getClinicalTagVariant,
  getEventBadgeVariant,
  getRiskBadgeVariant,
  getStatusBadgeVariant,
} from '../../components/Badge';
import { beneficiariosMock } from '../../data/mock';
import { buildExpandedDeclaration, buildUnifiedTimeline, getStatusEvento } from '../../utils/beneficiaryInsights';
import { gerarEvolucaoRisco } from '../../utils/riskEvolution';

function groupDeclarationItems(title: string, items: string[]) {
  return { title, items };
}

function getPreRiskBadgeVariant(nivel: ReturnType<typeof gerarEvolucaoRisco>['nivelPreRisco']) {
  if (nivel === 'Atenção imediata') return 'alert-critical';
  if (nivel === 'Pré-risco') return 'alert-high';
  if (nivel === 'Monitorar') return 'alert-medium';
  return 'alert-low';
}

export default function BeneficiarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const beneficiario = useMemo(() => beneficiariosMock.find((item) => item.id === id), [id]);
  const timeline = useMemo(() => (beneficiario ? buildUnifiedTimeline(beneficiario) : []), [beneficiario]);
  const declaracao = useMemo(() => (beneficiario ? buildExpandedDeclaration(beneficiario) : null), [beneficiario]);
  const evolucao = useMemo(() => (beneficiario ? gerarEvolucaoRisco(beneficiario) : null), [beneficiario]);

  const groupedDeclaration = useMemo(
    () =>
      declaracao
        ? [
            groupDeclarationItems('Doenças preexistentes', declaracao.doencasPreexistentes),
            groupDeclarationItems('Lesões e cirurgias', declaracao.lesoesCirurgias),
            groupDeclarationItems('Tratamentos contínuos e medicações', declaracao.tratamentosContinuos),
            groupDeclarationItems('Internações e exames', declaracao.internacoesExames),
            groupDeclarationItems('Hábitos de vida e dados físicos', declaracao.habitosVidaDadosFisicos),
            groupDeclarationItems('Histórico familiar', declaracao.historicoFamiliar),
          ]
        : [],
    [declaracao]
  );

  if (!beneficiario || !evolucao) {
    return (
      <AppShell active="beneficiarios">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Beneficiário não encontrado</h1>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="beneficiarios">
      <div className="flex flex-col gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/beneficiarios')}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Voltar para Beneficiários
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/beneficiarios/${beneficiario.id}/score`)}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ver score
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/beneficiarios/${beneficiario.id}/plano`)}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Ver plano assistencial
                </button>
              </div>

              <p className="mt-5 text-sm font-medium text-emerald-600">Detalhe clínico e assistencial</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">{beneficiario.nome}</h1>
              <p className="mt-2 text-sm text-slate-500">
                Consolida score, condição clínica, declaração de saúde, medicamentos, eventos sincronizados e evolução prognóstica.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                <Badge variant={getPreRiskBadgeVariant(evolucao.nivelPreRisco)}>{evolucao.nivelPreRisco}</Badge>
                <Badge variant={getRiskBadgeVariant(evolucao.riscoFuturo)}>Risco futuro {evolucao.riscoFuturo}</Badge>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Health Score {beneficiario.score}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[760px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Área</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{beneficiario.area}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{beneficiario.status}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Condição</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{beneficiario.condicao}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pré-risco</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.nivelPreRisco}</p>
            <p className="mt-1 text-sm text-slate-500">Score prognóstico {evolucao.scorePreRisco}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risco futuro</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.riscoFuturo}</p>
            <p className="mt-1 text-sm text-slate-500">{evolucao.probabilidadeRiscoFuturo}% de probabilidade</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Janela</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.janelaRiscoFuturo}</p>
            <p className="mt-1 text-sm text-slate-500">Horizonte de maior atenção</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Categoria principal</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{evolucao.categoriaPrincipal}</p>
            <p className="mt-1 text-sm text-slate-500">{evolucao.recomendacaoPrimaria}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Declaração de saúde</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Blocos ampliados</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {groupedDeclaration.map((block) => (
                <div key={block.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{block.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {block.items.length > 0 ? (
                      block.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Sem registros relevantes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Evolução de risco</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Drivers analíticos</h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Justificativa</p>
              <p className="mt-2 text-sm text-slate-700">{evolucao.justificativaAnalitica}</p>
            </div>

            <div className="mt-4 space-y-3">
              {evolucao.drivers.length > 0 ? (
                evolucao.drivers.map((driver) => (
                  <div key={driver.codigo} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{driver.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{driver.evidencias.join(' • ')}</p>
                      </div>

                      <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        +{driver.pontos}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Sem drivers relevantes de progressão no horizonte atual.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Medicamentos e eventos</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Base sincronizada</h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Medicamentos ativos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {beneficiario.medicamentos.length > 0 ? (
                  beneficiario.medicamentos.map((med) => (
                    <span
                      key={med.nome}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {med.nome}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">Sem medicações em uso contínuo</span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recomendação primária</p>
              <p className="mt-2 text-sm text-slate-700">{evolucao.recomendacaoPrimaria}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">Eventos mais recentes</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Timeline única do caso</h2>

            <div className="mt-5 flex flex-col gap-3">
              {timeline.slice(0, 6).map((evento, index) => {
                const status = getStatusEvento(evento.data);
                const eventVariant =
                  evento.tipo === 'Internação'
                    ? 'event-procedimento'
                    : getEventBadgeVariant(evento.tipo);

                return (
                  <div
                    key={`${evento.nome}-${evento.data}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={eventVariant}>{evento.tipo}</Badge>
                      <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{evento.data}</span>
                      {evento.destaque ? (
                        <Badge variant={getClinicalTagVariant(evento.destaque)}>{evento.destaque}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{evento.nome}</p>
                    <p className="mt-1 text-xs text-slate-500">{evento.observacao}</p>
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
