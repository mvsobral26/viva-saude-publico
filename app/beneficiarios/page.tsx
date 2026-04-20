'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { beneficiariosMock } from '../data/mock';
import Badge, { getRiskBadgeVariant } from '../components/Badge';

type SegmentoFila = 'todos' | 'acao_imediata' | 'ativar_semana' | 'monitorar';
type ModoVisualizacao = 'fila' | 'base';

function getSegmentoPorRisco(risco: string): Exclude<SegmentoFila, 'todos'> {
  if (risco === 'Alto') return 'acao_imediata';
  if (risco === 'Médio') return 'ativar_semana';
  return 'monitorar';
}

function getTituloSegmento(segmento: SegmentoFila) {
  if (segmento === 'acao_imediata') return 'Ação imediata';
  if (segmento === 'ativar_semana') return 'Ativar nesta semana';
  if (segmento === 'monitorar') return 'Monitorar';
  return 'Todos';
}

function ordenarAlfabeticamente<T>(items: T[], selector: (item: T) => string) {
  return [...items].sort((a, b) => selector(a).localeCompare(selector(b), 'pt-BR'));
}

export default function BeneficiariosPage() {
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>('fila');
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<SegmentoFila>('todos');

  const [buscaNome, setBuscaNome] = useState('');
  const [riscoSelecionado, setRiscoSelecionado] = useState('Todos');
  const [areaSelecionada, setAreaSelecionada] = useState('Todos');
  const [statusSelecionado, setStatusSelecionado] = useState('Todos');

  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement | null>(null);

  const areas = useMemo(
    () => ['Todos', ...ordenarAlfabeticamente(Array.from(new Set(beneficiariosMock.map((b) => b.area))), (item) => item)],
    []
  );

  const statusList = useMemo(
    () =>
      ['Todos', ...ordenarAlfabeticamente(Array.from(new Set(beneficiariosMock.map((b) => b.status))), (item) => item)],
    []
  );

  const filtroAtivo = useMemo<'nome' | 'risco' | 'area' | 'status' | null>(() => {
    if (buscaNome.trim()) return 'nome';
    if (riscoSelecionado !== 'Todos') return 'risco';
    if (areaSelecionada !== 'Todos') return 'area';
    if (statusSelecionado !== 'Todos') return 'status';
    return null;
  }, [buscaNome, riscoSelecionado, areaSelecionada, statusSelecionado]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!autocompleteRef.current) return;
      if (!autocompleteRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function limparFiltros() {
    setBuscaNome('');
    setRiscoSelecionado('Todos');
    setAreaSelecionada('Todos');
    setStatusSelecionado('Todos');
    setMostrarSugestoes(false);
  }

  function selecionarFiltroNome(valor: string) {
    setRiscoSelecionado('Todos');
    setAreaSelecionada('Todos');
    setStatusSelecionado('Todos');
    setBuscaNome(valor);
  }

  function selecionarFiltroRisco(valor: string) {
    setBuscaNome('');
    setAreaSelecionada('Todos');
    setStatusSelecionado('Todos');
    setMostrarSugestoes(false);
    setRiscoSelecionado(valor);
  }

  function selecionarFiltroArea(valor: string) {
    setBuscaNome('');
    setRiscoSelecionado('Todos');
    setStatusSelecionado('Todos');
    setMostrarSugestoes(false);
    setAreaSelecionada(valor);
  }

  function selecionarFiltroStatus(valor: string) {
    setBuscaNome('');
    setRiscoSelecionado('Todos');
    setAreaSelecionada('Todos');
    setMostrarSugestoes(false);
    setStatusSelecionado(valor);
  }

  const sugestoesNome = useMemo(() => {
  const termo = buscaNome.trim().toLowerCase();

  if (!termo) {
    return [];
  }

  const baseOrdenada = ordenarAlfabeticamente(beneficiariosMock, (item) => item.nome);

  return baseOrdenada.filter((beneficiario) => beneficiario.nome.toLowerCase().includes(termo)).slice(0, 20);
}, [buscaNome]);

  const beneficiariosBase = useMemo(() => {
    return beneficiariosMock.filter((beneficiario) => {
      if (buscaNome.trim()) {
        return beneficiario.nome.toLowerCase().includes(buscaNome.trim().toLowerCase());
      }

      if (riscoSelecionado !== 'Todos') {
        return beneficiario.risco === riscoSelecionado;
      }

      if (areaSelecionada !== 'Todos') {
        return beneficiario.area === areaSelecionada;
      }

      if (statusSelecionado !== 'Todos') {
        return beneficiario.status === statusSelecionado;
      }

      return true;
    });
  }, [buscaNome, riscoSelecionado, areaSelecionada, statusSelecionado]);

  const beneficiariosFiltrados = useMemo(() => {
    if (segmentoSelecionado === 'todos') return beneficiariosBase;
    return beneficiariosBase.filter((beneficiario) => getSegmentoPorRisco(beneficiario.risco) === segmentoSelecionado);
  }, [beneficiariosBase, segmentoSelecionado]);

  const contagemAcaoImediata = useMemo(
    () => beneficiariosBase.filter((b) => getSegmentoPorRisco(b.risco) === 'acao_imediata').length,
    [beneficiariosBase]
  );

  const contagemAtivarSemana = useMemo(
    () => beneficiariosBase.filter((b) => getSegmentoPorRisco(b.risco) === 'ativar_semana').length,
    [beneficiariosBase]
  );

  const contagemMonitorar = useMemo(
    () => beneficiariosBase.filter((b) => getSegmentoPorRisco(b.risco) === 'monitorar').length,
    [beneficiariosBase]
  );

  const totalFila = beneficiariosFiltrados.length;

  function getClasseCardSegmento(segmento: Exclude<SegmentoFila, 'todos'>) {
    const ativo = segmentoSelecionado === segmento;

    if (segmento === 'acao_imediata') {
      return ativo
        ? 'border-red-300 bg-red-50 shadow-sm ring-2 ring-red-100'
        : 'border-red-200 bg-white hover:border-red-300 hover:bg-red-50/60';
    }

    if (segmento === 'ativar_semana') {
      return ativo
        ? 'border-amber-300 bg-amber-50 shadow-sm ring-2 ring-amber-100'
        : 'border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/70';
    }

    return ativo
      ? 'border-emerald-300 bg-emerald-50 shadow-sm ring-2 ring-emerald-100'
      : 'border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/70';
  }

  function getClasseTextoSegmento(segmento: Exclude<SegmentoFila, 'todos'>) {
    if (segmento === 'acao_imediata') {
      return {
        title: 'text-red-800',
        desc: 'text-red-900/80',
        dot: 'bg-red-500',
      };
    }

    if (segmento === 'ativar_semana') {
      return {
        title: 'text-amber-800',
        desc: 'text-amber-900/80',
        dot: 'bg-amber-500',
      };
    }

    return {
      title: 'text-emerald-800',
      desc: 'text-emerald-900/80',
      dot: 'bg-emerald-500',
    };
  }

  const nomeDesabilitado = filtroAtivo !== null && filtroAtivo !== 'nome';
  const riscoDesabilitado = filtroAtivo !== null && filtroAtivo !== 'risco';
  const areaDesabilitada = filtroAtivo !== null && filtroAtivo !== 'area';
  const statusDesabilitado = filtroAtivo !== null && filtroAtivo !== 'status';

  return (
    <AppShell active="beneficiarios">
      <div className="min-w-0 overflow-x-hidden">
        <div className="mx-auto flex min-w-0 max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          <PageHeader
            title="Beneficiários"
            description="Busque por nome ou filtre por risco atual, área ou status."
            meta={
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
                <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  {totalFila} beneficiário(s)
                  <br />
                  na fila atual
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setModoVisualizacao('fila')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      modoVisualizacao === 'fila'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Fila operacional
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoVisualizacao('base')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      modoVisualizacao === 'base'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Base completa
                  </button>
                </div>
              </div>
            }
          />

          <section className="min-w-0 rounded-[28px] border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div ref={autocompleteRef} className="relative min-w-0">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nome</label>
                <input
                  value={buscaNome}
                  disabled={nomeDesabilitado}
                  onChange={(e) => {
  const valor = e.target.value;
  selecionarFiltroNome(valor);
  setMostrarSugestoes(Boolean(valor.trim()));
}}
                 onFocus={() => {
  if (!nomeDesabilitado && buscaNome.trim()) {
    setMostrarSugestoes(true);
  }
}}
                  placeholder="Digite para buscar por nome"
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    nomeDesabilitado
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                  }`}
                />

                {!nomeDesabilitado && buscaNome.trim() && mostrarSugestoes ? (
  <div className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-slate-300 bg-white p-2 shadow-xl">
    {sugestoesNome.length > 0 ? (
      sugestoesNome.map((beneficiario) => (
        <button
          key={beneficiario.id}
          type="button"
          onClick={() => {
            selecionarFiltroNome(beneficiario.nome);
            setMostrarSugestoes(false);
          }}
          className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
        >
          <p className="truncate text-sm font-semibold text-slate-950">{beneficiario.nome}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {beneficiario.area} • {beneficiario.status}
          </p>
        </button>
      ))
    ) : (
      <div className="px-3 py-3 text-sm text-slate-500">
        Nenhum beneficiário encontrado para essa busca.
      </div>
    )}
  </div>
) : null}
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Risco atual</label>
                <select
                  value={riscoSelecionado}
                  disabled={riscoDesabilitado}
                  onChange={(e) => selecionarFiltroRisco(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    riscoDesabilitado
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                  }`}
                >
                  <option>Todos</option>
                  <option>Alto</option>
                  <option>Médio</option>
                  <option>Baixo</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Área</label>
                <select
                  value={areaSelecionada}
                  disabled={areaDesabilitada}
                  onChange={(e) => selecionarFiltroArea(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    areaDesabilitada
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                  }`}
                >
                  {areas.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={statusSelecionado}
                  disabled={statusDesabilitado}
                  onChange={(e) => selecionarFiltroStatus(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    statusDesabilitado
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white'
                  }`}
                >
                  {statusList.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={limparFiltros}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpar filtros
              </button>
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                setSegmentoSelecionado((prev) => (prev === 'acao_imediata' ? 'todos' : 'acao_imediata'))
              }
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${getClasseCardSegmento('acao_imediata')}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${getClasseTextoSegmento('acao_imediata').title}`}>
                    Ação imediata
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemAcaoImediata}</p>
                  <p className={`mt-2 text-sm leading-6 ${getClasseTextoSegmento('acao_imediata').desc}`}>
                    Casos críticos, com foco em execução assistencial e dono claro da ação.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getClasseTextoSegmento('acao_imediata').dot}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setSegmentoSelecionado((prev) => (prev === 'ativar_semana' ? 'todos' : 'ativar_semana'))
              }
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${getClasseCardSegmento('ativar_semana')}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${getClasseTextoSegmento('ativar_semana').title}`}>
                    Ativar nesta semana
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemAtivarSemana}</p>
                  <p className={`mt-2 text-sm leading-6 ${getClasseTextoSegmento('ativar_semana').desc}`}>
                    Casos que pedem contato ativo e organização da agenda ao longo da semana.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getClasseTextoSegmento('ativar_semana').dot}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSegmentoSelecionado((prev) => (prev === 'monitorar' ? 'todos' : 'monitorar'))}
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${getClasseCardSegmento('monitorar')}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${getClasseTextoSegmento('monitorar').title}`}>
                    Monitorar
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemMonitorar}</p>
                  <p className={`mt-2 text-sm leading-6 ${getClasseTextoSegmento('monitorar').desc}`}>
                    Casos estáveis, de prevenção ou vigilância leve, sem urgência operacional.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getClasseTextoSegmento('monitorar').dot}`} />
              </div>
            </button>
          </section>

          <section className="min-w-0 rounded-[28px] border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-950">
                  {modoVisualizacao === 'fila' ? 'Fila operacional' : 'Base completa'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {segmentoSelecionado === 'todos'
                    ? 'Exibindo todos os beneficiários conforme o filtro selecionado.'
                    : `Exibindo apenas os beneficiários de ${getTituloSegmento(segmentoSelecionado).toLowerCase()}.`}
                </p>
              </div>

              {segmentoSelecionado !== 'todos' ? (
                <button
                  type="button"
                  onClick={() => setSegmentoSelecionado('todos')}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar card
                </button>
              ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
              {beneficiariosFiltrados.map((beneficiario) => (
                <Link
                  key={beneficiario.id}
                  href={`/beneficiarios/${beneficiario.id}`}
                  className="group min-w-0 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-bold text-slate-950">{beneficiario.nome}</p>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {beneficiario.area} • {beneficiario.condicao}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_120px]">
                    <div className="min-w-0 rounded-xl border border-slate-300 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">CPF</p>
                      <p className="mt-1 text-sm font-bold text-slate-950">{beneficiario.cpf}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1 whitespace-normal break-words text-sm font-bold leading-5 text-slate-950">
                        {beneficiario.status}
                      </p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</p>
                      <p className="mt-1 text-sm font-bold text-slate-950">{beneficiario.score}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {beneficiariosFiltrados.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-medium text-slate-500">
                Nenhum beneficiário encontrado com os filtros atuais.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
