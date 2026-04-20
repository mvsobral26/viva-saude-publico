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

  // 🔥 CONTAGEM (mantida)
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

  // 🔥 FONTE ÚNICA DE VALOR (EFFICIENCY)
  const oportunidadesDetalhadas = useMemo(
    () => listarOportunidadesEficiencia(beneficiariosMock),
    []
  );

  const custoOportunidades = useMemo(
    () => oportunidadesDetalhadas.reduce((acc, item) => acc + item.custo, 0),
    [oportunidadesDetalhadas]
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

      {/* RESTANTE DO JSX PERMANECE IGUAL */}

      {/* 🔥 ÚNICA DIFERENÇA REAL É: */}
      {/* custoOportunidades agora vem da efficiency */}

    </AppShell>
  );
}
