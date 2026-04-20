'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { beneficiariosMock } from '../data/mock';
import Badge, { getRiskBadgeVariant } from '../components/Badge';

type SegmentoFila = 'todos' | 'acao_imediata' | 'ativar_semana' | 'monitorar';
type ModoVisualizacao = 'fila' | 'base';
type TipoFiltro = 'nome' | 'risco' | 'area' | 'status';

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

export default function BeneficiariosPage() {
  const [modoFila, setModoFila] = useState<ModoVisualizacao>('fila');
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<SegmentoFila>('todos');

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('nome');
  const [filtroNome, setFiltroNome] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [filtroRisco, setFiltroRisco] = useState('Todos');
  const [filtroArea, setFiltroArea] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const autocompleteRef = useRef<HTMLDivElement | null>(null);

  const areas = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.area))).sort()],
    []
  );

  const statusList = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.status))).sort()],
    []
  );

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

  function limparFiltroAtual(novoTipo?: TipoFiltro) {
    setFiltroNome('');
    setMostrarSugestoes(false);
    setFiltroRisco('Todos');
    setFiltroArea('Todos');
    setFiltroStatus('Todos');

    if (novoTipo) {
      setTipoFiltro(novoTipo);
    }
  }

  const sugestoesNome = useMemo(() => {
    const termo = filtroNome.trim().toLowerCase();

    if (!termo) {
      return beneficiariosMock.slice(0, 8);
    }

    const unicos = new Map<number, (typeof beneficiariosMock)[number]>();

    beneficiariosMock.forEach((beneficiario) => {
      if (beneficiario.nome.toLowerCase().includes(termo)) {
        unicos.set(beneficiario.id, beneficiario);
      }
    });

    return Array.from(unicos.values()).slice(0, 8);
  }, [filtroNome]);

  const beneficiariosBase = useMemo(() => {
    return beneficiariosMock.filter((beneficiario) => {
      if (tipoFiltro === 'nome') {
        const termo = filtroNome.trim().toLowerCase();
        if (!termo) return true;
        return beneficiario.nome.toLowerCase().includes(termo);
      }

      if (tipoFiltro === 'risco') {
        if (filtroRisco === 'Todos') return true;
        return beneficiario.risco === filtroRisco;
      }

      if (tipoFiltro === 'area') {
        if (filtroArea === 'Todos') return true;
        return beneficiario.area === filtroArea;
      }

      if (tipoFiltro === 'status') {
        if (filtroStatus === 'Todos') return true;
        return beneficiario.status === filtroStatus;
      }

      return true;
    });
  }, [tipoFiltro, filtroNome, filtroRisco, filtroArea, filtroStatus]);

  const beneficiariosFiltrados = useMemo(() => {
    if (segmentoSelecionado === 'todos') return beneficiariosBase;
    return beneficiariosBase.filter((b) => getSegmentoPorRisco(b.risco) === segmentoSelecionado);
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

  function renderClasseCardSegmento(segmento: Exclude<SegmentoFila, 'todos'>) {
    const ativo = segmentoSelecionado === segmento;

    if (segmento === 'acao_imediata') {
      return ativo
        ? 'border-red-300 bg-red-100 shadow-sm ring-2 ring-red-200'
        : 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/80';
    }

    if (segmento === 'ativar_semana') {
      return ativo
        ? 'border-amber-300 bg-amber-100 shadow-sm ring-2 ring-amber-200'
        : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/80';
    }

    return ativo
      ? 'border-emerald-300 bg-emerald-100 shadow-sm ring-2 ring-emerald-200'
      : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/80';
  }

  function renderClasseTextoSegmento(segmento: Exclude<SegmentoFila, 'todos'>) {
    if (segmento === 'acao_imediata') {
      return {
        eyebrow: 'text-red-800',
        description: 'text-red-900/85',
        dot: 'bg-red-500',
      };
    }

    if (segmento === 'ativar_semana') {
      return {
        eyebrow: 'text-amber-800',
        description: 'text-amber-900/85',
        dot: 'bg-amber-500',
      };
    }

    return {
      eyebrow: 'text-emerald-800',
      description: 'text-emerald-900/85',
      dot: 'bg-emerald-500',
    };
  }

  return (
    <AppShell active="beneficiarios">
      <div className="min-w-0 overflow-x-hidden">
        <div className="mx-auto flex min-w-0 max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          <PageHeader
            title="Beneficiários"
            description="Busque por nome, risco atual, área ou status."
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
                    onClick={() => setModoFila('fila')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      modoFila === 'fila'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Fila operacional
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoFila('base')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      modoFila === 'base'
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
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Filtrar por</label>
                <select
                  value={tipoFiltro}
                  onChange={(e) => limparFiltroAtual(e.target.value as TipoFiltro)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                >
                  <option value="nome">Nome</option>
                  <option value="risco">Risco atual</option>
                  <option value="area">Área</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="min-w-0">
                {tipoFiltro === 'nome' ? (
                  <div ref={autocompleteRef} className="relative min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nome do beneficiário</label>
                    <input
                      value={filtroNome}
                      onChange={(e) => {
                        setFiltroNome(e.target.value);
                        setMostrarSugestoes(true);
                      }}
                      onFocus={() => setMostrarSugestoes(true)}
                      placeholder="Digite para buscar por nome"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                    />

                    {mostrarSugestoes && sugestoesNome.length > 0 ? (
                      <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-300 bg-white p-2 shadow-lg">
                        {sugestoesNome.map((beneficiario) => (
                          <button
                            key={beneficiario.id}
                            type="button"
                            onClick={() => {
                              setFiltroNome(beneficiario.nome);
                              setMostrarSugestoes(false);
                            }}
                            className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{beneficiario.nome}</p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {beneficiario.area} • {beneficiario.status}
                              </p>
                            </div>
                            <span className="ml-3 shrink-0 text-xs text-slate-400">{beneficiario.id}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {tipoFiltro === 'risco' ? (
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Risco atual</label>
                    <select
                      value={filtroRisco}
                      onChange={(e) => setFiltroRisco(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                    >
                      <option>Todos</option>
                      <option>Alto</option>
                      <option>Médio</option>
                      <option>Baixo</option>
                    </select>
                  </div>
                ) : null}

                {tipoFiltro === 'area' ? (
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Área</label>
                    <select
                      value={filtroArea}
                      onChange={(e) => setFiltroArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                    >
                      {areas.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {tipoFiltro === 'status' ? (
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                    >
                      {statusList.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => limparFiltroAtual()}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"
                >
                  Limpar filtro
                </button>
              </div>
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                setSegmentoSelecionado((prev) => (prev === 'acao_imediata' ? 'todos' : 'acao_imediata'))
              }
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${renderClasseCardSegmento(
                'acao_imediata'
              )}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      renderClasseTextoSegmento('acao_imediata').eyebrow
                    }`}
                  >
                    Ação imediata
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemAcaoImediata}</p>
                  <p className={`mt-2 text-sm leading-6 ${renderClasseTextoSegmento('acao_imediata').description}`}>
                    Casos críticos, com foco em execução assistencial e dono claro da ação.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${renderClasseTextoSegmento('acao_imediata').dot}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setSegmentoSelecionado((prev) => (prev === 'ativar_semana' ? 'todos' : 'ativar_semana'))
              }
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${renderClasseCardSegmento(
                'ativar_semana'
              )}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      renderClasseTextoSegmento('ativar_semana').eyebrow
                    }`}
                  >
                    Ativar nesta semana
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemAtivarSemana}</p>
                  <p className={`mt-2 text-sm leading-6 ${renderClasseTextoSegmento('ativar_semana').description}`}>
                    Casos que pedem contato ativo e organização da agenda ao longo da semana.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${renderClasseTextoSegmento('ativar_semana').dot}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSegmentoSelecionado((prev) => (prev === 'monitorar' ? 'todos' : 'monitorar'))}
              className={`min-w-0 rounded-[28px] border p-5 text-left transition ${renderClasseCardSegmento(
                'monitorar'
              )}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      renderClasseTextoSegmento('monitorar').eyebrow
                    }`}
                  >
                    Monitorar
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{contagemMonitorar}</p>
                  <p className={`mt-2 text-sm leading-6 ${renderClasseTextoSegmento('monitorar').description}`}>
                    Casos estáveis, de prevenção ou vigilância leve, sem urgência operacional.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${renderClasseTextoSegmento('monitorar').dot}`} />
              </div>
            </button>
          </section>

          <section className="min-w-0 rounded-[28px] border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-950">
                  {modoFila === 'fila' ? 'Fila operacional' : 'Base completa'}
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
                  className="group min-w-0 rounded-2xl border border-slate-300 bg-slate-50 p-4 shadow-sm transition hover:border-emerald-300 hover:bg-white"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-bold text-slate-950">{beneficiario.nome}</p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-600">
                        {beneficiario.area} • {beneficiario.condicao}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">CPF</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-950">{beneficiario.cpf}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-950">{beneficiario.status}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
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
