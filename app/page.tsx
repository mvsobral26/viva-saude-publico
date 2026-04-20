'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from './components/AppShell';
import StatCard from './components/StatCard';
import { beneficiariosMock } from './data/mock';
import { gerarResumoScore } from './utils/healthScore';
import { gerarEvolucaoRisco } from './utils/riskEvolution';
import {
  identificarOportunidadeEficiencia,
  listarOportunidadesEficiencia,
  type TipoOportunidade,
} from './utils/efficiency';
import { enriquecerBeneficiariosOperacionais, ordenarFilaOperacional } from './utils/operationalQueue';
import { calcularResumoSinistralidade } from './utils/sinistralidade';
import type { Risco } from './types';

function getBarColor(label: Risco) {
  if (label === 'Alto') return 'bg-red-500';
  if (label === 'Médio') return 'bg-amber-500';
  return 'bg-emerald-500';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
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
    () =>
      beneficiariosMock.map((beneficiario) => ({
        beneficiario,
        evolucao: gerarEvolucaoRisco(beneficiario),
      })),
    []
  );

  const filaOperacional = useMemo(
    () => ordenarFilaOperacional(enriquecerBeneficiariosOperacionais(beneficiariosMock)),
    []
  );

  const oportunidades = useMemo(() => {
    const base = {
      'PA evitável': 0,
      'Exame com possível redundância': 0,
      'Consulta com baixa resolutividade': 0,
      'Repetição assistencial': 0,
    } as Record<TipoOportunidade, number>;

    beneficiariosMock.forEach((beneficiario) => {
      const oportunidade = identificarOportunidadeEficiencia(beneficiario);
      if (oportunidade) {
        base[oportunidade] += 1;
      }
    });

    return base;
  }, []);

  const oportunidadesDetalhadas = useMemo(
    () => listarOportunidadesEficiencia(beneficiariosMock),
    []
  );

  const alto = beneficiariosMock.filter((b) => b.risco === 'Alto').length;
  const medio = beneficiariosMock.filter((b) => b.risco === 'Médio').length;
  const baixo = beneficiariosMock.filter((b) => b.risco === 'Baixo').length;

  const preRiscoAtivo = evolucoes.filter(
    ({ evolucao }) =>
      evolucao.nivelPreRisco === 'Pré-risco' || evolucao.nivelPreRisco === 'Atenção imediata'
  ).length;

  const riscoFuturoAlto = evolucoes.filter(({ evolucao }) => evolucao.riscoFuturo === 'Alto').length;
  const acaoImediata = filaOperacional.filter((item) => item.filaStatus === 'Ação imediata').length;
  const ativarSemana = filaOperacional.filter((item) => item.filaStatus === 'Ativar nesta semana').length;

  const custoTotal = beneficiariosMock.reduce((acc, item) => acc + item.custoPotencial30d, 0);

  const custoOportunidades = useMemo(
    () => oportunidadesDetalhadas.reduce((acc, item) => acc + item.custo, 0),
    [oportunidadesDetalhadas]
  );

  const resumoSinistralidade = useMemo(
    () =>
      calcularResumoSinistralidade(beneficiariosMock, {
        receitaMensalCarteira: 2400000,
        metaSinistralidade: 0.7,
        faixaAtencao: 1,
      }),
    []
  );

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

  const baseEstavel = evolucoes.filter(
    ({ beneficiario, evolucao }) =>
      beneficiario.risco === 'Baixo' &&
      evolucao.riscoFuturo === 'Baixo' &&
      (evolucao.nivelPreRisco === 'Estável' || evolucao.nivelPreRisco === 'Monitorar')
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
        categorias: Record<string, number>;
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
        categorias: {},
      };

      atual.total += 1;
      atual.scoreTotal += beneficiario.score;
      atual.custoTotal += beneficiario.custoPotencial30d;
      atual.categorias[evolucao.categoriaPrincipal] =
        (atual.categorias[evolucao.categoriaPrincipal] ?? 0) + 1;

      if (beneficiario.risco === 'Alto') atual.altoRisco += 1;
      if (evolucao.riscoFuturo === 'Alto') atual.altoRiscoFuturo += 1;

      mapa.set(beneficiario.area, atual);
    });

    return Array.from(mapa.values())
      .map((item) => {
        const principalDriver =
          Object.entries(item.categorias).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sem sinal relevante';

        return {
          ...item,
          scoreMedio: Math.round(item.scoreTotal / item.total),
          principalDriver,
        };
      })
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

  const principaisOportunidades = [
    {
      tipo: 'PA evitável' as TipoOportunidade,
      valor: oportunidades['PA evitável'],
      descricao: 'Uso recorrente de pronto atendimento em janela curta.',
    },
    {
      tipo: 'Exame com possível redundância' as TipoOportunidade,
      valor: oportunidades['Exame com possível redundância'],
      descricao: 'Mesma solicitação repetida sem ganho assistencial aparente.',
    },
    {
      tipo: 'Consulta com baixa resolutividade' as TipoOportunidade,
      valor: oportunidades['Consulta com baixa resolutividade'],
      descricao: 'Múltiplas consultas sem fechamento assistencial consistente.',
    },
    {
      tipo: 'Repetição assistencial' as TipoOportunidade,
      valor: oportunidades['Repetição assistencial'],
      descricao: 'Recorrência de eventos em até 30 dias com potencial de otimização.',
    },
  ].sort((a, b) => b.valor - a.valor);

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
          value={formatCurrency(custoTotal)}
          subtitle="Estimativa para 30 dias"
        />
        <StatCard
          title="Ação imediata"
          value={String(acaoImediata)}
          subtitle="Fila operacional crítica"
        />
        <StatCard
          title="Ativar nesta semana"
          value={String(ativarSemana)}
          subtitle="Casos para coordenação ativa"
        />
        <StatCard
          title="Risco futuro alto"
          value={String(riscoFuturoAlto)}
          subtitle="Estimativa do modelo preditivo"
        />
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Orquestração assistencial
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Fila operacional priorizada</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Quem exige atuação imediata, quem deve ser ativado nesta semana e quem pode seguir em
              monitoramento preventivo.
            </p>
          </div>

          <Link
            href="/beneficiarios"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Abrir fila operacional
          </Link>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {[
            {
              titulo: 'Ação imediata',
              valor: filaOperacional.filter((item) => item.filaStatus === 'Ação imediata').length,
              descricao: 'Casos críticos com alta urgência operacional.',
              classe: 'border-red-200 bg-red-50',
              destaque: 'text-red-700',
            },
            {
              titulo: 'Ativar nesta semana',
              valor: filaOperacional.filter((item) => item.filaStatus === 'Ativar nesta semana').length,
              descricao: 'Beneficiários que exigem coordenação ativa de curto prazo.',
              classe: 'border-amber-200 bg-amber-50',
              destaque: 'text-amber-700',
            },
            {
              titulo: 'Monitorar',
              valor: filaOperacional.filter((item) => item.filaStatus === 'Monitorar').length,
              descricao: 'Base preventiva com acompanhamento estruturado.',
              classe: 'border-emerald-200 bg-emerald-50',
              destaque: 'text-emerald-700',
            },
          ].map((item) => (
            <div key={item.titulo} className={`rounded-2xl border p-5 ${item.classe}`}>
              <p className="text-sm font-medium text-slate-600">{item.titulo}</p>
              <p className={`mt-2 text-3xl font-bold ${item.destaque}`}>{item.valor}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Modelo preditivo
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Leitura de risco futuro</h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Score + eventos + continuidade
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            O risco futuro é estimado a partir do histórico assistencial, padrão de uso, alertas e sinais de
            descontinuidade de cuidado, tornando explícita a lógica preditiva da IA.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Health Score preditivo médio
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{scoreMedio}</p>
              <p className="mt-2 text-sm text-slate-500">Visão consolidada da carteira monitorada.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Base estável</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{baseEstavel}</p>
              <p className="mt-2 text-sm text-slate-500">
                Baixo risco atual e futuro, com seguimento preservado.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Valor de negócio
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Impacto financeiro estimado</h2>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Horizonte de 30 dias
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Estimativa baseada no custo potencial assistencial já projetado pela carteira e nas oportunidades
            identificadas de intervenção em uso evitável, redundância e baixa resolutividade.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Economia potencial endereçável
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(custoOportunidades)}</p>
            <p className="mt-2 text-sm text-slate-500">
              Leitura executiva para priorizar frentes com maior retorno assistencial e financeiro.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">PA evitável</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{oportunidades['PA evitável']}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Redundância / baixa resolução
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {oportunidades['Exame com possível redundância'] +
                  oportunidades['Consulta com baixa resolutividade']}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Eficiência assistencial
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Oportunidades prioritárias</h2>
            </div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Foco operacional
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {principaisOportunidades.map((item) => (
              <Link
                key={item.tipo}
                href="/eficiencia"
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.tipo}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.descricao}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.valor}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
              Sustentabilidade financeira
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Sinistralidade da carteira</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Leitura executiva derivada do custo potencial da base, conectada aos drivers clínicos e de
              eficiência já existentes no Viva+.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Meta {formatPercent(0.7)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Sinistralidade atual
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatPercent(resumoSinistralidade.sinistralidadeAtual)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Relação entre custo projetado e receita mensal estimada.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pós-intervenção</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {formatPercent(resumoSinistralidade.sinistralidadeAjustada)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Cenário com captura parcial do custo evitável.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gap para meta</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {formatPercent(resumoSinistralidade.gapMeta)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Distância atual até o patamar executivo desejado.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Principal driver</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {resumoSinistralidade.principalDriver}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Frente com maior alavanca potencial de redução.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Custo projetado</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(resumoSinistralidade.custoTotalProjetado)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Receita de referência
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(resumoSinistralidade.receitaMensalCarteira)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Economia potencial</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {formatCurrency(resumoSinistralidade.economiaPotencial)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Participação de custo por risco</p>
            <div className="mt-4 space-y-3">
              {resumoSinistralidade.porRisco.map((item) => (
                <div key={item.risco}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.risco}</span>
                    <span className="font-medium text-slate-900">
                      {formatPercent(item.participacaoCusto)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${item.participacaoCusto * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Drivers de redução endereçáveis</p>
            <div className="mt-4 space-y-3">
              {resumoSinistralidade.porOportunidade
                .filter((item) => item.quantidade > 0)
                .slice(0, 4)
                .map((item) => (
                  <div key={item.tipo} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.tipo}</p>
                      <p className="text-xs text-slate-500">{item.quantidade} casos identificados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.potencialReducao)}
                      </p>
                      <p className="text-xs text-slate-500">potencial de redução</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
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
          <h2 className="text-2xl font-bold text-slate-900">Distribuição por risco futuro estimado</h2>
          <p className="mt-1 text-sm text-slate-500">
            Probabilidade de migração de risco com base no score preditivo, eventos, alertas e continuidade
            de cuidado.
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
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Health Score preditivo médio
              </p>
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
            Áreas com maior concentração de risco futuro alto e principal driver clínico-operacional para
            intervenção.
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
                      {area.total} beneficiário(s) • {area.altoRisco} alto risco atual •{' '}
                      {area.altoRiscoFuturo} alto risco futuro
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Principal driver: {area.principalDriver}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Score médio</p>
                    <p className="text-2xl font-bold text-slate-900">{area.scoreMedio}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatCurrency(area.custoTotal)}</p>
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
                <p className="mt-2 text-sm text-slate-500">{evolucao.justificativaAnalitica}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
