'use client';

import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { beneficiariosMock } from '../data/mock';
import Badge, { getRiskBadgeVariant } from '../components/Badge';

export default function BeneficiariosPage() {
  const [busca, setBusca] = useState('');
  const [risco, setRisco] = useState('Todos');
  const [area, setArea] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [condicao, setCondicao] = useState('');
  const [modoFila, setModoFila] = useState<'fila' | 'base'>('fila');

  const areas = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.area))).sort()],
    []
  );

  const statusList = useMemo(
    () => ['Todos', ...Array.from(new Set(beneficiariosMock.map((b) => b.status))).sort()],
    []
  );

  const beneficiariosFiltrados = useMemo(() => {
    return beneficiariosMock.filter((b) => {
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        b.nome.toLowerCase().includes(termo) ||
        b.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));

      const matchRisco = risco === 'Todos' || b.risco === risco;
      const matchArea = area === 'Todos' || b.area === area;
      const matchStatus = status === 'Todos' || b.status === status;
      const matchCondicao =
        !condicao.trim() || b.condicao.toLowerCase().includes(condicao.trim().toLowerCase());

      return matchBusca && matchRisco && matchArea && matchStatus && matchCondicao;
    });
  }, [busca, risco, area, status, condicao]);

  const filaOperacional = useMemo(() => {
    return beneficiariosFiltrados;
  }, [beneficiariosFiltrados]);

  const totalFila = filaOperacional.length;

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
            <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ação imediata</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">
                {filaOperacional.filter((b) => b.risco === 'Alto').length}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Casos com maior necessidade de acompanhamento humano prioritário.
              </p>
            </div>

            <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Custo imediato</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">R$ 290.350</p>
              <p className="mt-2 text-sm text-slate-500">Custo potencial dos casos em ação imediata.</p>
            </div>

            <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Base filtrada</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">{beneficiariosFiltrados.length}</p>
              <p className="mt-2 text-sm text-slate-500">Beneficiários considerando os filtros atuais.</p>
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="min-w-0 rounded-[28px] border border-red-200 bg-red-50 p-5 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Ação imediata</p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {filaOperacional.filter((b) => b.risco === 'Alto').length}
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    Casos críticos com foco em execução assistencial e dono da ação.
                  </p>
                </div>
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />
              </div>
            </div>

            <div className="min-w-0 rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Ativar nesta semana</p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {filaOperacional.filter((b) => b.risco === 'Médio').length}
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Casos que precisam de contato e organização da agenda ao longo da semana.
                  </p>
                </div>
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-500" />
              </div>
            </div>

            <div className="min-w-0 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Monitorar</p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {filaOperacional.filter((b) => b.risco === 'Baixo').length}
                  </p>
                  <p className="mt-2 text-sm text-emerald-700">
                    Casos estáveis, de prevenção ou vigilância leve, sem urgência operacional.
                  </p>
                </div>
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {modoFila === 'fila' ? 'Fila operacional' : 'Base completa'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Beneficiários exibidos sem forçar largura horizontal.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
              {beneficiariosFiltrados.map((beneficiario) => (
                <div
                  key={beneficiario.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-900">{beneficiario.nome}</p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {beneficiario.area} • {beneficiario.condicao}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>{beneficiario.risco}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">CPF</p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-900">{beneficiario.cpf}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1 truncate text-sm font-medium text-slate-900">{beneficiario.status}</p>
                    </div>

                    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Score</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{beneficiario.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
