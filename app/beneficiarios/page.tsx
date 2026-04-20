'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '../components/AppShell';
import Badge, {
  getFlowBadgeVariant,
  getRiskBadgeVariant,
} from '../components/Badge';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import TableFooter from '../components/TableFooter';
import { getQueueColorKey, queueColors } from '../design-system/queueColors';
import { beneficiariosMock } from '../data/mock';
import type { Risco } from '../types';
import {
  enriquecerBeneficiariosOperacionais,
  ordenarFilaOperacional,
  type BeneficiarioOperacional,
  type FilaOperacionalStatus,
  type ModoFila,
} from '../utils/operationalQueue';

type FiltroRisco = 'Todos' | Risco;
type FiltroStatus =
  | 'Todos'
  | 'Sem acompanhamento'
  | 'Acompanhamento pendente'
  | 'Monitoramento intensivo'
  | 'Atenção imediata'
  | 'Estável'
  | 'Em monitoramento'
  | 'Em tratamento'
  | 'Acompanhamento preventivo';

type FiltroFilaResumo = 'Todos' | FilaOperacionalStatus;

const ITENS_POR_PAGINA = 10;

function formatarCPF(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
}

function getPreRiskVariant(nivel: BeneficiarioOperacional['evolucao']['nivelPreRisco']) {
  if (nivel === 'Atenção imediata') return 'alert-critical';
  if (nivel === 'Pré-risco') return 'alert-high';
  if (nivel === 'Monitorar') return 'alert-medium';
  return 'alert-low';
}

function getFilaVisual(status: FilaOperacionalStatus) {
  const key = getQueueColorKey(status);
  const colors = queueColors[key];

  return {
    badge: `inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${colors.badgeStrong}`,
    summaryWrapper: `${colors.border} ${colors.surfaceSoft}`,
    cardWrapper: `${colors.border} ${colors.surfaceCard}`,
    accent: colors.dot,
    title: colors.textStrong,
    subtitle: colors.text,
    support: colors.textSoft,
    button: colors.buttonGhost,
  };
}

function getLinhaDestaqueClasses(beneficiario: BeneficiarioOperacional) {
  if (beneficiario.filaStatus === 'Ação imediata') {
    return 'bg-red-50/60 hover:bg-red-50 focus:bg-red-50';
  }

  if (beneficiario.filaStatus === 'Ativar nesta semana') {
    return 'bg-amber-50/40 hover:bg-amber-50 focus:bg-amber-50';
  }

  return 'hover:bg-slate-50 focus:bg-slate-50';
}

function BeneficiariosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topoResumoRef = useRef<HTMLElement | null>(null);
  const tabelaRef = useRef<HTMLElement | null>(null);

  const [autorizado, setAutorizado] = useState(false);
  const [modo, setModo] = useState<ModoFila>('Fila operacional');
  const [busca, setBusca] = useState('');
  const [filtroRisco, setFiltroRisco] = useState<FiltroRisco>('Todos');
  const [filtroArea, setFiltroArea] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('Todos');
  const [filtroCondicao, setFiltroCondicao] = useState('');
  const [filtroFilaResumo, setFiltroFilaResumo] = useState<FiltroFilaResumo>('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const areaInicial = searchParams.get('area') ?? '';

  useEffect(() => {
    const authStatus = sessionStorage.getItem('auth-status');

    if (authStatus !== 'authenticated') {
      router.replace('/login');
      return;
    }

    setAutorizado(true);
  }, [router]);

  useEffect(() => {
    if (areaInicial) {
      setFiltroArea(areaInicial);
    }
  }, [areaInicial]);

  const beneficiariosEnriquecidos = useMemo(
    () => ordenarFilaOperacional(enriquecerBeneficiariosOperacionais(beneficiariosMock)),
    []
  );

  const areasDisponiveis = useMemo(() => {
    return Array.from(new Set(beneficiariosEnriquecidos.map((beneficiario) => beneficiario.area))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
  }, [beneficiariosEnriquecidos]);

  const statusDisponiveis = useMemo(() => {
    return Array.from(new Set(beneficiariosEnriquecidos.map((beneficiario) => beneficiario.status))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    ) as FiltroStatus[];
  }, [beneficiariosEnriquecidos]);

  const condicoesDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        beneficiariosEnriquecidos
          .map((beneficiario) => beneficiario.condicao?.trim())
          .filter((condicao): condicao is string => Boolean(condicao))
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [beneficiariosEnriquecidos]);

  const beneficiariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return beneficiariosEnriquecidos.filter((beneficiario) => {
      const matchBusca =
        termo.length === 0
          ? true
          : beneficiario.nome.toLowerCase().includes(termo) ||
            formatarCPF(beneficiario.cpf).includes(termo) ||
            beneficiario.cpf.includes(termo);

      const matchRisco = filtroRisco === 'Todos' ? true : beneficiario.risco === filtroRisco;
      const matchArea = filtroArea === 'Todos' ? true : beneficiario.area === filtroArea;
      const matchStatus = filtroStatus === 'Todos' ? true : beneficiario.status === filtroStatus;
      const matchCondicao =
        filtroCondicao.trim().length === 0
          ? true
          : beneficiario.condicao.toLowerCase().includes(filtroCondicao.trim().toLowerCase());
      const matchFilaResumo =
        filtroFilaResumo === 'Todos' ? true : beneficiario.filaStatus === filtroFilaResumo;

      return matchBusca && matchRisco && matchArea && matchStatus && matchCondicao && matchFilaResumo;
    });
  }, [
    beneficiariosEnriquecidos,
    busca,
    filtroRisco,
    filtroArea,
    filtroStatus,
    filtroCondicao,
    filtroFilaResumo,
  ]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroRisco, filtroArea, filtroStatus, filtroCondicao, filtroFilaResumo]);

  const totalPaginas = Math.max(1, Math.ceil(beneficiariosFiltrados.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);

  const beneficiariosPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return beneficiariosFiltrados.slice(inicio, fim);
  }, [beneficiariosFiltrados, paginaSegura]);

  const inicioItem = beneficiariosFiltrados.length === 0 ? 0 : (paginaSegura - 1) * ITENS_POR_PAGINA + 1;
  const fimItem = Math.min(paginaSegura * ITENS_POR_PAGINA, beneficiariosFiltrados.length);

  const resumoGlobalFila = useMemo(() => {
    const acaoImediata = beneficiariosEnriquecidos.filter((b) => b.filaStatus === 'Ação imediata');
    const ativarSemana = beneficiariosEnriquecidos.filter((b) => b.filaStatus === 'Ativar nesta semana');
    const monitorar = beneficiariosEnriquecidos.filter((b) => b.filaStatus === 'Monitorar');
    const humanos = beneficiariosEnriquecidos.filter((b) => b.fluxo === 'Humano prioritário');

    return {
      acaoImediata,
      ativarSemana,
      monitorar,
      humanos,
      custoImediato: acaoImediata.reduce((acc, item) => acc + item.custoPotencial30d, 0),
      coberturaMonitoramento:
        beneficiariosEnriquecidos.length > 0
          ? Math.round((monitorar.length / beneficiariosEnriquecidos.length) * 100)
          : 0,
    };
  }, [beneficiariosEnriquecidos]);

  const resumoFila = useMemo(() => {
    const acaoImediata = beneficiariosFiltrados.filter((b) => b.filaStatus === 'Ação imediata');
    const ativarSemana = beneficiariosFiltrados.filter((b) => b.filaStatus === 'Ativar nesta semana');
    const monitorar = beneficiariosFiltrados.filter((b) => b.filaStatus === 'Monitorar');

    return {
      acaoImediata,
      ativarSemana,
      monitorar,
    };
  }, [beneficiariosFiltrados]);

  const colunasFila = useMemo(() => {
    return [
      {
        status: 'Ação imediata' as FilaOperacionalStatus,
        title: 'Ação imediata',
        subtitle: 'Casos para tratar agora, com foco em execução assistencial e dono da ação.',
        items: resumoFila.acaoImediata.slice(0, 2),
      },
      {
        status: 'Ativar nesta semana' as FilaOperacionalStatus,
        title: 'Ativar nesta semana',
        subtitle: 'Casos que precisam de contato e organização da agenda ao longo da semana.',
        items: resumoFila.ativarSemana.slice(0, 2),
      },
      {
        status: 'Monitorar' as FilaOperacionalStatus,
        title: 'Monitorar',
        subtitle: 'Casos estáveis, de prevenção ou vigilância leve, sem urgência operacional.',
        items: resumoFila.monitorar.slice(0, 2),
      },
    ];
  }, [resumoFila]);

  const filtroFilaAtivo = filtroFilaResumo !== 'Todos';
  const visualFiltroFila = filtroFilaAtivo ? getFilaVisual(filtroFilaResumo) : null;

  function rolarParaTabela() {
    requestAnimationFrame(() => {
      tabelaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function voltarParaVisaoGeral() {
    setFiltroFilaResumo('Todos');
    setModo('Fila operacional');
    setPaginaAtual(1);

    requestAnimationFrame(() => {
      topoResumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function limparFiltroAreaInicial() {
    setFiltroArea('Todos');
    router.push('/beneficiarios');
  }

  function abrirDetalheBeneficiario(id: number) {
    router.push(`/beneficiarios/${id}`);
  }

  function abrirBaseOperacionalFiltrada(status: FilaOperacionalStatus) {
    setFiltroFilaResumo(status);
    setModo('Base completa');
    setPaginaAtual(1);
    rolarParaTabela();
  }

  if (!autorizado) {
    return null;
  }

  return (
    <AppShell active="beneficiarios">
      <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
        <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <PageHeader
            eyebrow="Fila operacional"
            title="Beneficiários"
            description="Organize a carteira com um CRM de cuidado: quem atuar agora, quem ativar nesta semana e quem pode seguir em monitoramento preventivo."
            meta={
              <div className="max-w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {beneficiariosFiltrados.length} beneficiário(s) na fila atual
              </div>
            }
            actions={
              <div className="flex w-full flex-wrap justify-start gap-2 xl:justify-end">
                <Button
                  type="button"
                  variant={modo === 'Fila operacional' ? 'primary' : 'secondary'}
                  onClick={() => setModo('Fila operacional')}
                >
                  Fila operacional
                </Button>
                <Button
                  type="button"
                  variant={modo === 'Base completa' ? 'primary' : 'secondary'}
                  onClick={() => setModo('Base completa')}
                >
                  Base completa
                </Button>
              </div>
            }
          />

          {areaInicial && (
            <div className="mt-5 flex min-w-0 flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Filtro de área aplicado</p>
                <p className="mt-1 text-sm text-emerald-900">
                  A lista foi aberta a partir da área <span className="font-semibold">{areaInicial}</span>.
                </p>
              </div>

              <Button type="button" variant="secondary" onClick={limparFiltroAreaInicial}>
                Limpar filtro de área
              </Button>
            </div>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="md:col-span-2 xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Buscar por nome ou CPF</label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite nome ou CPF"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Risco atual</label>
              <select
                value={filtroRisco}
                onChange={(e) => setFiltroRisco(e.target.value as FiltroRisco)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="Todos">Todos</option>
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Área</label>
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="Todos">Todos</option>
                {areasDisponiveis.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="Todos">Todos</option>
                {statusDisponiveis.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Condição</label>
              <input
                list="condicoes-beneficiarios"
                type="text"
                value={filtroCondicao}
                onChange={(e) => setFiltroCondicao(e.target.value)}
                placeholder="Digite ou selecione uma condição"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <datalist id="condicoes-beneficiarios">
                {condicoesDisponiveis.map((condicao) => (
                  <option key={condicao} value={condicao} />
                ))}
              </datalist>
            </div>
          </div>
        </section>

        <section ref={topoResumoRef} className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fluxo humano</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{resumoGlobalFila.humanos.length}</p>
            <p className="mt-2 text-sm text-slate-500">Beneficiários demandando acompanhamento humano prioritário.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Custo imediato</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatarMoeda(resumoGlobalFila.custoImediato)}</p>
            <p className="mt-2 text-sm text-slate-500">Custo potencial dos casos em ação imediata.</p>
          </div>
        </section>

        {modo === 'Fila operacional' ? (
          <section className="grid items-start gap-4 2xl:grid-cols-3">
            {colunasFila.map((coluna) => {
              const visual = getFilaVisual(coluna.status);
              const totalEtapa = beneficiariosFiltrados.filter((item) => item.filaStatus === coluna.status).length;
              const ocultos = Math.max(0, totalEtapa - coluna.items.length);

              return (
                <div
                  key={coluna.status}
                  className={`min-w-0 overflow-hidden rounded-3xl border p-5 shadow-sm ${visual.summaryWrapper}`}
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${visual.title}`}>
                        {coluna.title}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {totalEtapa}
                      </h2>
                      <p className={`mt-2 text-sm font-medium ${visual.subtitle}`}>{coluna.subtitle}</p>
                    </div>

                    <span className={`mt-1 h-3 w-3 rounded-full ${visual.accent}`} />
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    {coluna.items.length > 0 ? (
                      coluna.items.map((beneficiario) => (
                        <button
                          key={beneficiario.id}
                          type="button"
                          onClick={() => abrirDetalheBeneficiario(beneficiario.id)}
                          className="rounded-2xl border border-white/90 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">{beneficiario.nome}</h3>
                              <p className="mt-1 text-sm text-slate-600">
                                {beneficiario.area} • {beneficiario.perfilClinico}
                              </p>
                            </div>

                            <span className={getFilaVisual(beneficiario.filaStatus).badge}>
                              {beneficiario.filaStatus}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant={getFlowBadgeVariant(beneficiario.fluxo)}>{beneficiario.fluxo}</Badge>
                            <Badge variant={getRiskBadgeVariant(beneficiario.evolucao.riscoFuturo)}>
                              Futuro {beneficiario.evolucao.riscoFuturo} • {beneficiario.evolucao.janelaRiscoFuturo}
                            </Badge>
                            <Badge variant={getPreRiskVariant(beneficiario.evolucao.nivelPreRisco)}>
                              {beneficiario.evolucao.nivelPreRisco}
                            </Badge>
                          </div>

                          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Próxima ação
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {beneficiario.proximaAcao.titulo}
                              </p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <p>Prazo operacional</p>
                              <p className="mt-1 font-semibold text-slate-700">{beneficiario.filaStatus}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>{beneficiario.sinaisPrioritarios[0] ?? 'Sem sinal prioritário adicional'}</span>
                            <span className="font-semibold text-slate-700">{formatarMoeda(beneficiario.custoPotencial30d)}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-500">
                        Nenhum beneficiário nesta etapa com os filtros atuais.
                      </div>
                    )}

                    {ocultos > 0 ? (
                      <button
                        type="button"
                        onClick={() => abrirBaseOperacionalFiltrada(coluna.status)}
                        className={`inline-flex items-center justify-center rounded-2xl border bg-white px-4 py-2 text-sm font-medium transition ${visual.button}`}
                      >
                        Ver mais {ocultos} caso(s) na base operacional
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        <section
          ref={tabelaRef}
          className={`rounded-3xl border bg-white shadow-sm transition-all duration-300 ${
            filtroFilaAtivo ? 'border-emerald-200 ring-4 ring-emerald-100/70' : 'border-slate-200'
          }`}
        >
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Base operacional da fila</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ordenação automática por fila, fluxo, próxima ação e contexto assistencial, com foco em execução.
                </p>
              </div>

              <div className="max-w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Página {paginaSegura} de {totalPaginas}. Exibindo {inicioItem}–{fimItem} de {beneficiariosFiltrados.length} registros filtrados.
              </div>
            </div>

            {filtroFilaAtivo && visualFiltroFila ? (
              <div className={`mt-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${visualFiltroFila.summaryWrapper}`}>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${visualFiltroFila.title}`}>
                    Visão filtrada da base operacional
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={visualFiltroFila.badge}>{filtroFilaResumo}</span>
                    <span className={`text-sm ${visualFiltroFila.subtitle}`}>
                      Você está vendo apenas os beneficiários desta etapa da fila.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={voltarParaVisaoGeral}>
                    Voltar para visão geral
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1780px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-500">
                  <th className="px-6 py-4">Beneficiário</th>
                  <th className="px-6 py-4">Fila</th>
                  <th className="px-6 py-4">Fluxo</th>
                  <th className="px-6 py-4">Risco atual</th>
                  <th className="px-6 py-4">Pré-risco</th>
                  <th className="px-6 py-4">Risco futuro</th>
                  <th className="px-6 py-4">Próxima ação</th>
                  <th className="px-6 py-4">Sinais prioritários</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Custo potencial</th>
                </tr>
              </thead>
              <tbody>
                {beneficiariosPaginados.map((beneficiario) => (
                  <tr
                    key={beneficiario.id}
                    onClick={() => abrirDetalheBeneficiario(beneficiario.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        abrirDetalheBeneficiario(beneficiario.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={`group cursor-pointer border-t border-slate-100 align-top transition focus:outline-none ${getLinhaDestaqueClasses(
                      beneficiario
                    )}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 transition-colors group-hover:text-emerald-700 group-focus:text-emerald-700">
                          {beneficiario.nome}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatarCPF(beneficiario.cpf)} • {beneficiario.area} • {beneficiario.perfilClinico}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getFilaVisual(beneficiario.filaStatus).badge}>{beneficiario.filaStatus}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getFlowBadgeVariant(beneficiario.fluxo)}>{beneficiario.fluxo}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPreRiskVariant(beneficiario.evolucao.nivelPreRisco)}>
                        {beneficiario.evolucao.nivelPreRisco}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Badge variant={getRiskBadgeVariant(beneficiario.evolucao.riscoFuturo)}>
                          {beneficiario.evolucao.riscoFuturo} • {beneficiario.evolucao.janelaRiscoFuturo}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {beneficiario.evolucao.probabilidadeRiscoFuturo}% • {beneficiario.evolucao.categoriaPrincipal}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[360px]">
                        <p className="text-sm font-semibold text-slate-900">{beneficiario.proximaAcao.titulo}</p>
                        <p className="mt-1 text-sm text-slate-600">{beneficiario.proximaAcao.descricao}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex max-w-[320px] flex-wrap gap-2">
                        {beneficiario.sinaisPrioritarios.slice(0, 3).map((sinal) => (
                          <span
                            key={`${beneficiario.id}-${sinal}`}
                            className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {sinal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{beneficiario.status}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatarMoeda(beneficiario.custoPotencial30d)}
                      </div>
                    </td>
                  </tr>
                ))}

                {beneficiariosPaginados.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                      Nenhum beneficiário encontrado para os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TableFooter
            from={inicioItem}
            to={fimItem}
            total={beneficiariosFiltrados.length}
            page={paginaSegura}
            totalPages={totalPaginas}
            onPageChange={setPaginaAtual}
            label="beneficiário(s)"
          />
        </section>
      </div>
    </AppShell>
  );
}

export default function BeneficiariosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <BeneficiariosPageContent />
    </Suspense>
  );
}
