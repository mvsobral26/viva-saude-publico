'use client';

import { useMemo, useState } from 'react';
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

type AnaliseIA = {
  resumo_executivo: string;
  drivers_risco: string[];
  prioridade_acao: 'monitorar' | 'atuar_semana' | 'imediato';
  acao_recomendada: string;
  justificativa: string;
};

function getPrioridadeIaClasses(prioridade: AnaliseIA['prioridade_acao']) {
  if (prioridade === 'imediato') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (prioridade === 'atuar_semana') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function getPrioridadeIaLabel(prioridade: AnaliseIA['prioridade_acao']) {
  if (prioridade === 'imediato') return 'Imediato';
  if (prioridade === 'atuar_semana') return 'Atuar nesta semana';
  return 'Monitorar';
}

export default function BeneficiarioDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const beneficiario = useMemo(() => beneficiariosMock.find((item) => item.id === id), [id]);
  const timeline = useMemo(() => (beneficiario ? buildUnifiedTimeline(beneficiario) : []), [beneficiario]);
  const declaracao = useMemo(() => (beneficiario ? buildExpandedDeclaration(beneficiario) : null), [beneficiario]);
  const evolucao = useMemo(() => (beneficiario ? gerarEvolucaoRisco(beneficiario) : null), [beneficiario]);
  const [analiseIA, setAnaliseIA] = useState<AnaliseIA | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);

  async function handleAnalisarIA() {
    if (!beneficiario) return;

    setCarregandoIA(true);
    setErroIA(null);

    try {
      const response = await fetch(`/api/ia-beneficiario/${beneficiario.id}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setErroIA(data?.erro ?? 'Não foi possível gerar a análise com IA.');
        return;
      }

      setAnaliseIA(data.resposta as AnaliseIA);
    } catch {
      setErroIA('Não foi possível gerar a análise com IA.');
    } finally {
      setCarregandoIA(false);
    }
  }

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

                <button
                  type="button"
                  onClick={handleAnalisarIA}
                  disabled={carregandoIA}
                  className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {carregandoIA ? 'Analisando com IA...' : analiseIA ? 'Gerar nova análise com IA' : 'Analisar com IA'}
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Análise automatizada Viva+</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Resumo executivo e recomendação operacional</h2>
              <p className="mt-2 text-sm text-slate-500">
                Leitura gerada automaticamente a partir dos dados assistenciais do beneficiário, com identificação de risco, prioridade e ação recomendada.
              </p>
            </div>
          </div>

          {erroIA ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erroIA}
            </div>
          ) : null}

          {analiseIA ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prioridade sugerida</p>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPrioridadeIaClasses(
                        analiseIA.prioridade_acao
                      )}`}
                    >
                      {getPrioridadeIaLabel(analiseIA.prioridade_acao)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">{analiseIA.resumo_executivo}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ação recomendada</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{analiseIA.acao_recomendada}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Justificativa</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{analiseIA.justificativa}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Drivers de risco</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analiseIA.drivers_risco.length > 0 ? (
                    analiseIA.drivers_risco.map((driver) => (
                      <span
                        key={driver}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {driver}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Sem drivers retornados pela IA.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">Nenhuma análise gerada ainda</p>
              <p className="mt-2 text-sm text-slate-500">
                Clique em <span className="font-medium text-slate-700">Analisar com IA</span> para gerar um resumo executivo,
                drivers de risco e recomendação operacional a partir dos dados atuais deste beneficiário.
              </p>
            </div>
          )}
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
                  evento.tipo === 'Internação' ? 'event-procedimento' : getEventBadgeVariant(evento.tipo);

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
