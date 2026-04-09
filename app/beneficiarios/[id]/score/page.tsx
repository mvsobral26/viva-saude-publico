'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import Badge, { getRiskBadgeVariant } from '../../../components/Badge';
import { beneficiariosMock } from '../../../data/mock';
import type { Beneficiario } from '../../../types';
import { gerarEvolucaoRisco } from '../../../utils/riskEvolution';

type FatorScore = {
  label: string;
  rawPoints: number;
};

function arredondarDistribuicao(valores: number[], totalAlvo: number) {
  const pisos = valores.map((v) => Math.floor(v));
  let soma = pisos.reduce((acc, v) => acc + v, 0);
  const restos = valores
    .map((v, i) => ({ index: i, resto: v - Math.floor(v) }))
    .sort((a, b) => b.resto - a.resto);

  let i = 0;
  while (soma < totalAlvo && i < restos.length) {
    pisos[restos[i].index] += 1;
    soma += 1;
    i += 1;
  }

  return pisos;
}

function construirFatores(beneficiario: Beneficiario): FatorScore[] {
  const fatores: FatorScore[] = [];

  if (beneficiario.declaracao.diabetes) fatores.push({ label: 'Diabetes', rawPoints: 20 });
  if (beneficiario.declaracao.hipertensao) fatores.push({ label: 'Hipertensão', rawPoints: 20 });
  if (beneficiario.declaracao.atividadeFisicaRegular === false) fatores.push({ label: 'Sedentarismo', rawPoints: 15 });
  if (beneficiario.declaracao.acompanhamentoRegular === false) fatores.push({ label: 'Sem acompanhamento regular', rawPoints: 10 });
  if ((beneficiario.medicamentos?.length ?? 0) >= 4) fatores.push({ label: 'Múltiplos medicamentos', rawPoints: 15 });
  if ((beneficiario.eventos?.length ?? 0) >= 2) fatores.push({ label: 'Eventos recentes', rawPoints: 20 });
  if ((beneficiario.custoPotencial30d ?? 0) >= 20000) fatores.push({ label: 'Alto custo potencial', rawPoints: 10 });

  if (fatores.length === 0) {
    fatores.push({ label: 'Perfil assistencial estável', rawPoints: 10 });
  }

  return fatores;
}

function getPreRiskBadgeVariant(nivel: ReturnType<typeof gerarEvolucaoRisco>['nivelPreRisco']) {
  if (nivel === 'Atenção imediata') return 'alert-critical';
  if (nivel === 'Pré-risco') return 'alert-high';
  if (nivel === 'Monitorar') return 'alert-medium';
  return 'alert-low';
}


function getScoreColor(score: number) {
  if (score >= 85) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 40) return '#fbbf24';
  return '#10b981';
}

export default function ScorePage() {
  const params = useParams();
  const router = useRouter();
  const autorizado = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('auth-status') === 'authenticated',
    () => false
  );

  const id = Number(params?.id);
  const beneficiario = useMemo(
    () => beneficiariosMock.find((item) => item.id === id),
    [id]
  );

  const analise = useMemo(() => {
    if (!beneficiario) return null;

    const fatoresRaw = construirFatores(beneficiario);
    const totalRaw = fatoresRaw.reduce((acc, item) => acc + item.rawPoints, 0);
    const scoreAtual = beneficiario.score ?? 0;

    const distribuicaoEscalada =
      totalRaw > 0
        ? arredondarDistribuicao(
            fatoresRaw.map((item) => (item.rawPoints / totalRaw) * scoreAtual),
            scoreAtual
          )
        : fatoresRaw.map(() => 0);

    const fatores = fatoresRaw.map((item, index) => ({
      ...item,
      pontos: distribuicaoEscalada[index],
    }));

    const maiorValor = Math.max(...fatores.map((item) => item.pontos), 0);
    const maioresFatores = fatores.filter((item) => item.pontos === maiorValor).map((item) => item.label);

    return {
      scoreAtual,
      totalExplicado: fatores.reduce((acc, item) => acc + item.pontos, 0),
      fatores,
      maiorValor,
      maioresFatores,
    };
  }, [beneficiario]);

  const evolucao = useMemo(() => (beneficiario ? gerarEvolucaoRisco(beneficiario) : null), [beneficiario]);

  if (!autorizado) return null;

  if (!beneficiario || !analise || !evolucao) {
    return (
      <AppShell active="beneficiarios">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Beneficiário não encontrado</h1>
        </div>
      </AppShell>
    );
  }

  const maxPontos = Math.max(...analise.fatores.map((item) => item.pontos), 1);
  const descricaoMaiorFator =
    analise.maioresFatores.length === 1
      ? analise.maioresFatores[0]
      : analise.maioresFatores.slice(0, -1).join(', ') + ' e ' + analise.maioresFatores.slice(-1);

  return (
    <AppShell active="beneficiarios">
      <div className="flex flex-col gap-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => router.push(`/beneficiarios/${beneficiario.id}`)}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar para o detalhe
          </button>

          <p className="mt-5 text-sm font-medium text-emerald-600">Análise detalhada</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Composição do Health Score</h1>
          <p className="mt-2 text-sm text-slate-500">
            Score atual e drivers de progressão futura explicados sem misturar presente e prognóstico.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Health Score atual</p>
            <p className="mt-2 text-5xl font-bold" style={{ color: getScoreColor(analise.scoreAtual) }}>{analise.scoreAtual}</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total explicado</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analise.totalExplicado}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {analise.maioresFatores.length > 1 ? 'Maiores fatores' : 'Maior fator'}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">{descricaoMaiorFator}</p>
                <p className="mt-1 text-sm text-slate-500">
                  +{analise.maiorValor} ponto{analise.maiorValor === 1 ? '' : 's'} cada
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Fatores que compõem o score</h2>
            <p className="mt-2 text-sm text-slate-500">
              Transparência dos principais elementos que influenciam o score atual.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {analise.fatores.map((fator) => {
                const percentual = Math.max(6, Math.round((fator.pontos / maxPontos) * 100));

                return (
                  <div
                    key={fator.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{fator.label}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Contribuição ajustada ao score atual
                        </p>
                      </div>

                      <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        +{fator.pontos}
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pré-risco</p>
            <div className="mt-2">
              <Badge variant={getPreRiskBadgeVariant(evolucao.nivelPreRisco)}>{evolucao.nivelPreRisco}</Badge>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{evolucao.scorePreRisco}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risco futuro</p>
            <div className="mt-2">
              <Badge variant={getRiskBadgeVariant(evolucao.riscoFuturo)}>{evolucao.riscoFuturo}</Badge>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{evolucao.probabilidadeRiscoFuturo}%</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Janela</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{evolucao.janelaRiscoFuturo}</p>
            <p className="mt-1 text-sm text-slate-500">{evolucao.categoriaPrincipal}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recomendação primária</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{evolucao.recomendacaoPrimaria}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Drivers de progressão futura</h2>
          <p className="mt-2 text-sm text-slate-500">{evolucao.justificativaAnalitica}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {evolucao.drivers.length > 0 ? (
              evolucao.drivers.map((driver) => (
                <div key={driver.codigo} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
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
                Sem drivers relevantes para risco futuro no horizonte atual.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
