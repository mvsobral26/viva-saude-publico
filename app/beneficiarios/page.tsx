'use client';

import { useMemo, useState } from 'react';
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

export default function BeneficiariosPage() {
  const [busca, setBusca] = useState('');
  const [risco, setRisco] = useState('Todos');
  const [area, setArea] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [condicao, setCondicao] = useState('');
  const [modoFila, setModoFila] = useState<ModoVisualizacao>('fila');
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<SegmentoFila>('todos');

  const areas = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.area))).sort()],
    []
  );

  const statusList = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.status))).sort()],
    []
  );

  const beneficiariosBase = useMemo(() => {
    return beneficiariosMock.filter((b) => {
      const termo = busca.trim().toLowerCase();
      const termoCpf = busca.replace(/\D/g, '');

      const matchBusca =
        !termo ||
        b.nome.toLowerCase().includes(termo) ||
        b.cpf.replace(/\D/g, '').includes(termoCpf);

      const matchRisco = risco === 'Todos' || b.risco === risco;
      const matchArea = area === 'Todos' || b.area === area;
      const matchStatus = status === 'Todos' || b.status === status;
      const matchCondicao =
        !condicao.trim() || b.condicao.toLowerCase().includes(condicao.trim().toLowerCase());

      return matchBusca && matchRisco && matchArea && matchStatus && matchCondicao;
    });
  }, [busca, risco, area, status, condicao]);

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
        : 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/70';
    }

    if (segmento === 'ativar_semana') {
      return ativo
        ? 'border-amber-300 bg-amber-100 shadow-sm ring-2 ring-amber-200'
        : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/70';
    }

    return ativo
      ? 'border-emerald-300 bg-emerald-100 shadow-sm ring-2 ring-emerald-200'
      : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/70';
  }

  function renderClasseTextoSegmento(segmento: Exclude<SegmentoFila, 'todos'>) {
    if (segmento === 'acao_imediata') {
      return {
        eyebrow: 'text-red-800',
        description: 'text-red-800/90',
        dot: 'bg-red-500',
      };
    }

    if (segmento === 'ativar_semana') {
      return {
        eyebrow: 'text-amber-800',
        description: 'text-amber-800/90',
        dot: 'bg-amber-500',
      };
    }

    return {
      eyebrow: 'text-emerald-800',
      description: 'text-emerald-800/90',
      dot: 'bg-emerald-500',
    };
  }

  return (
    <AppShell active="beneficiarios">
      <div className="min-w-0 overflow-x-hidden">
        <div className="mx-auto flex min-w-0 max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
          <PageHeader
            eyebrow="Bem-vindo ao Painel Viva+ Saúde"
            title="Beneficiários"
            description="Atue como um CRM de cuidado: quem atuar agora, quem ativar nesta semana e quem pode seguir em monitoramento preventivo."
            meta={
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
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

          <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">Nome ou CPF</label>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome ou CPF"
                  className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">Risco atual</label>
                <select
                  value={risco}
                  onChange={(e) => setRisco(e.target.value)}
                  className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                >
                  <option>Todos</option>
                  <option>Alto</option>
                  <option>Médio</option>
                  <option>Baixo</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">Área</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                >
                  {areas.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                >
                  {statusList.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 min-w-0 max-w-[420px]">
              <label className="mb-2 block text-sm font-medium text-slate-700">Condição</label>
              <input
                value={condicao}
                onChange={(e) => setCondicao(e.target.value)}
                placeholder="Selecione uma condição"
                className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              />
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
                  <p className="mt-2 text-4xl font-bold text-slate-900">{contagemAcaoImediata}</p>
                  <p className={`mt-2 text-sm ${renderClasseTextoSegmento('acao_imediata').description}`}>
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
                  <p className="mt-2 text-4xl font-bold text-slate-900">{contagemAtivarSemana}</p>
                  <p className={`mt-2 text-sm ${renderClasseTextoSegmento('ativar_semana').description}`}>
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
                  <p className="mt-2 text-4xl font-bold text-slate-900">{contagemMonitorar}</p>
                  <p className={`mt-2 text-sm ${renderClasseTextoSegmento('monitorar').description}`}>
                    Casos estáveis, de prevenção ou vigilância leve, sem urgência operacional.
                  </p>
                </div>
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${renderClasseTextoSegmento('monitorar').dot}`} />
              </div>
            </button>
          </section>

          <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {modoFila === 'fila' ? 'Fila operacional' : 'Base completa'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {segmentoSelecionado === 'todos'
                    ? 'Exibindo todos os beneficiários conforme os filtros selecionados.'
                    : 'Exibindo apenas os beneficiários do segmento operacional selecionado.'}
                </p>
              </div>

              {segmentoSelecionado !== 'todos' ? (
                <button
                  type="button"
                  onClick={() => setSegmentoSelecionado('todos')}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar filtro do card
                </button>
              ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
              {beneficiariosFiltrados.map((beneficiario) => (
                <div
                  key={beneficiario.id}
                  className="min-w-0 rounded-2xl border border-slate-300 bg-slate-100 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-emerald-300 hover:bg-white"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-900">{beneficiario.nome}</p>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {beneficiario.area} • {beneficiario.condicao}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">CPF</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{beneficiario.cpf}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{beneficiario.status}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-300 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{beneficiario.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {beneficiariosFiltrados.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Nenhum beneficiário encontrado com os filtros atuais.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
