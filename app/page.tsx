'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from './components/AppShell';
import StatCard from './components/StatCard';
import { beneficiariosMock } from './data/mock';
import { gerarResumoScore } from './utils/healthScore';
import { gerarEvolucaoRisco } from './utils/riskEvolution';

type Risco = 'Alto' | 'Médio' | 'Baixo';

function getBarColor(label: Risco) {
  if (label === 'Alto') return 'bg-red-500';
  if (label === 'Médio') return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function Home() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('auth-status');
    if (authStatus !== 'authenticated') {
      router.replace('/login');
      return;
    }
    setAutorizado(true);
  }, [router]);

  const total = beneficiariosMock.length;
  const evolucoes = useMemo(
    () => beneficiariosMock.map((beneficiario) => ({ beneficiario, evolucao: gerarEvolucaoRisco(beneficiario) })),
    []
  );

  const alto = beneficiariosMock.filter((b) => b.risco === 'Alto').length;
  const medio = beneficiariosMock.filter((b) => b.risco === 'Médio').length;
  const baixo = beneficiariosMock.filter((b) => b.risco === 'Baixo').length;

  const preRiscoAtivo = evolucoes.filter(({ evolucao }) =>
    evolucao.nivelPreRisco === 'Pré-risco' || evolucao.nivelPreRisco === 'Atenção imediata'
  ).length;

  const riscoFuturoAlto = evolucoes.filter(({ evolucao }) => evolucao.riscoFuturo === 'Alto').length;

  const custoTotal = beneficiariosMock.reduce((acc, item) => acc + item.custoPotencial30d, 0);

  const scoreMedio =
    total > 0
      ? Math.round(beneficiariosMock.reduce((acc, item) => acc + item.score, 0) / total)
      : 0;

  const semAcompanhamento = beneficiariosMock.filter(
    (b) =>
      b.status.toLowerCase().includes('sem acompanhamento') ||
      !b.declaracao.acompanhamentoRegular ||
      b.ultimoEventoDias > 90
  ).length;

  const topCriticos = useMemo(() => {
    return [...evolucoes]
      .sort((a, b) => {
        if (b.evolucao.probabilidadeRiscoFuturo !== a.evolucao.probabilidadeRiscoFuturo) {
          return b.evolucao.probabilidadeRiscoFuturo - a.evolucao.probabilidadeRiscoFuturo;
        }
        return b.beneficiario.score - a.beneficiario.score;
      })
      .slice(0, 5);
  }, [evolucoes]);

  const rankingAreas = useMemo(() => {
    const mapa = new Map<
      string,
      {
        area: string;
        total: number;
        altoRisco: number;
        altoRiscoFuturo: number;
        scoreTotal: number;
        custoTotal: number;
      }
    >();

    evolucoes.forEach(({ beneficiario, evolucao }) => {
      const atual = mapa.get(beneficiario.area) ?? {
        area: beneficiario.area,
        total: 0,
        altoRisco: 0,
        altoRiscoFuturo: 0,
        scoreTotal: 0,
        custoTotal: 0,
      };

      atual.total += 1;
      atual.scoreTotal += beneficiario.score;
      atual.custoTotal += beneficiario.custoPotencial30d;
      if (beneficiario.risco === 'Alto') atual.altoRisco += 1;
      if (evolucao.riscoFuturo === 'Alto') atual.altoRiscoFuturo += 1;

      mapa.set(beneficiario.area, atual);
    });

    return Array.from(mapa.values())
      .map((item) => ({
        ...item,
        scoreMedio: Math.round(item.scoreTotal / item.total),
      }))
      .sort((a, b) => {
        if (b.altoRiscoFuturo !== a.altoRiscoFuturo) return b.altoRiscoFuturo - a.altoRiscoFuturo;
        if (b.altoRisco !== a.altoRisco) return b.altoRisco - a.altoRisco;
        return b.scoreMedio - a.scoreMedio;
      })
      .slice(0, 5);
  }, [evolucoes]);

  const distribuicaoRiscoFuturo = useMemo(() => {
    return {
      Alto: evolucoes.filter(({ evolucao }) => evolucao.riscoFuturo === 'Alto').length,
      Médio: evolucoes.filter(({ evolucao }) => evolucao.riscoFuturo === 'Médio').length,
      Baixo: evolucoes.filter(({ evolucao }) => evolucao.riscoFuturo === 'Baixo').length,
    };
  }, [evolucoes]);

  if (!autorizado) return null;

  return (
    <AppShell active="dashboard">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Beneficiários monitorados"
          value={String(total)}
          subtitle="Base ativa para gestão assistencial"
        />
        <StatCard
          title="Custo potencial total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(custoTotal)}
          subtitle="Estimativa para 30 dias"
        />
        <StatCard
          title="Sem acompanhamento"
          value={String(semAcompanhamento)}
          subtitle="Indício de descontinuidade"
        />
        <StatCard
          title="Em pré-risco"
          value={String(preRiscoAtivo)}
          subtitle="Pré-risco ou atenção imediata"
        />
        <StatCard
          title="Risco futuro alto"
          value={String(riscoFuturoAlto)}
          subtitle="Horizonte prognóstico prioritário"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Distribuição por risco atual</h2>
          <p className="mt-1 text-sm text-slate-500">
            Visão consolidada da carteira por faixa de criticidade atual.
          </p>

          <div className="mt-6 space-y-5">
            {([
              { label: 'Alto', valor: alto },
              { label: 'Médio', valor: medio },
              { label: 'Baixo', valor: baixo },
            ] as { label: Risco; valor: number }[]).map((item) => {
              const percentual = total > 0 ? Math.round((item.valor / total) * 100) : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">
                      {item.valor} ({percentual}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full ${getBarColor(item.label)}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Distribuição por risco futuro</h2>
          <p className="mt-1 text-sm text-slate-500">
            Probabilidade de migração de risco com base em score atual, eventos, alertas e continuidade de cuidado.
          </p>

          <div className="mt-6 space-y-5">
            {([
              { label: 'Alto', valor: distribuicaoRiscoFuturo.Alto },
              { label: 'Médio', valor: distribuicaoRiscoFuturo.Médio },
              { label: 'Baixo', valor: distribuicaoRiscoFuturo.Baixo },
            ] as { label: Risco; valor: number }[]).map((item) => {
              const percentual = total > 0 ? Math.round((item.valor / total) * 100) : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">
                      {item.valor} ({percentual}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full ${getBarColor(item.label)}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Health Score médio</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{scoreMedio}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pré-risco ativo</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{preRiscoAtivo}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Top áreas prioritárias</h2>
          <p className="mt-1 text-sm text-slate-500">
            Áreas com maior concentração de risco futuro alto e maior necessidade de intervenção precoce.
          </p>

          <div className="mt-6 space-y-4">
            {rankingAreas.map((area, i) => (
              <Link
                key={area.area}
                href={`/beneficiarios?area=${encodeURIComponent(area.area)}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">#{i + 1}</p>
                    <p className="text-xl font-bold text-slate-900">{area.area}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {area.total} beneficiário(s) • {area.altoRisco} alto risco atual • {area.altoRiscoFuturo} alto risco futuro
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Score médio</p>
                    <p className="text-2xl font-bold text-slate-900">{area.scoreMedio}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(area.custoTotal)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Casos com maior risco futuro</h2>
          <p className="mt-1 text-sm text-slate-500">
            Beneficiários com maior probabilidade de agravamento no horizonte analisado.
          </p>

          <div className="mt-6 space-y-4">
            {topCriticos.map(({ beneficiario, evolucao }) => (
              <Link
                key={beneficiario.id}
                href={`/beneficiarios/${beneficiario.id}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{beneficiario.nome}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {beneficiario.area} • {beneficiario.status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {evolucao.probabilidadeRiscoFuturo}% em {evolucao.janelaRiscoFuturo}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-700">
                  {gerarResumoScore(beneficiario, beneficiario.score)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {evolucao.justificativaAnalitica}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
