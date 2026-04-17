'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import Badge, { getRiskBadgeVariant } from '../../../components/Badge';
import { beneficiariosMock } from '../../../data/mock';
import { gerarAcoesIA } from '../../../data/acoes-ia';
import { gerarEvolucaoRisco } from '../../../utils/riskEvolution';

function formatarReducao(valor: number) {
  return valor > 0 ? `-${valor}` : '0';
}

function getPriorityVariant(prioridade: 'Alta' | 'Média' | 'Baixa') {
  if (prioridade === 'Alta') return 'alert-critical';
  if (prioridade === 'Média') return 'alert-medium';
  return 'alert-low';
}

function getFlowVariant(fluxo: 'Humano prioritário' | 'IA assistida' | 'Preventivo automatizado') {
  if (fluxo === 'Humano prioritário') return 'alert-high';
  if (fluxo === 'IA assistida') return 'status-scheduled';
  return 'alert-low';
}

export default function PlanoAssistencialPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const beneficiario = useMemo(() => beneficiariosMock.find((b) => b.id === id), [id]);
  const evolucao = useMemo(() => (beneficiario ? gerarEvolucaoRisco(beneficiario) : null), [beneficiario]);
  const acoes = useMemo(() => (beneficiario ? gerarAcoesIA(beneficiario) : []), [beneficiario]);
  const [concluidas, setConcluidas] = useState<string[]>([]);

  const impactoReal = useMemo(() => {
    return acoes
      .filter((acao) => concluidas.includes(acao.id))
      .reduce((acc, acao) => acc + acao.impacto, 0);
  }, [acoes, concluidas]);

  const scoreAtual = beneficiario?.score ?? 0;
  const scoreReal = Math.max(0, scoreAtual - impactoReal);

  const toggleStatus = (idAcao: string) => {
    setConcluidas((prev) =>
      prev.includes(idAcao) ? prev.filter((idAtual) => idAtual !== idAcao) : [...prev, idAcao]
    );
  };

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
      <div className="flex flex-col gap-6 p-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push(`/beneficiarios/${beneficiario.id}`)}
                className="mb-4 inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Voltar para o detalhe
              </button>

              <p className="text-sm font-medium text-emerald-700">Execução assistencial</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Plano Assistencial</h1>
              <p className="mt-2 text-sm text-slate-600">
                Ações agrupadas para {beneficiario.nome}, já conectadas ao pré-risco e ao risco futuro.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 xl:w-[980px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score atual</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{scoreAtual}</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Impacto real</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{formatarReducao(impactoReal)}</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score real</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{scoreReal}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risco futuro</p>
                <div className="mt-2">
                  <Badge variant={getRiskBadgeVariant(evolucao.riscoFuturo)}>{evolucao.riscoFuturo}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{evolucao.probabilidadeRiscoFuturo}% em {evolucao.janelaRiscoFuturo}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pré-risco</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.nivelPreRisco}</p>
            <p className="mt-1 text-sm text-slate-500">Score prognóstico {evolucao.scorePreRisco}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Categoria principal</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{evolucao.categoriaPrincipal}</p>
            <p className="mt-1 text-sm text-slate-500">{evolucao.recomendacaoPrimaria}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Drivers ativos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.drivers.length}</p>
            <p className="mt-1 text-sm text-slate-500">{evolucao.justificativaAnalitica}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ações do plano</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ações com origem explícita em alertas, drivers prognósticos e fluxo de execução recomendado.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Concluídas</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {concluidas.length}/{acoes.length}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {acoes.map((acao) => {
              const done = concluidas.includes(acao.id);

              return (
                <div
                  key={acao.id}
                  className={`flex flex-col gap-4 rounded-2xl border p-5 ${
                    done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{acao.titulo}</h3>
                        <Badge variant="neutral">-{acao.impacto}</Badge>
                        <Badge variant={done ? 'status-done' : 'neutral'}>
                          {done ? 'Concluído' : 'Pendente'}
                        </Badge>
                        <Badge variant={getPriorityVariant(acao.prioridade)}>Prioridade {acao.prioridade}</Badge>
                        <Badge variant={getFlowVariant(acao.responsavelFluxo)}>{acao.responsavelFluxo}</Badge>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">{acao.descricao}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {acao.alertasOrigem.map((alerta) => (
                          <span
                            key={`${acao.id}-${alerta}`}
                            className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {alerta}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStatus(acao.id)}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        done ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {done ? 'Desfazer conclusão' : 'Marcar como feito'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
