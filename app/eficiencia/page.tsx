'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../components/AppShell';
import TableFooter from '../components/TableFooter';
import Badge, { getEfficiencyBadgeVariant } from '../components/Badge';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { TableTitle, TableWrapper } from '../components/Table';
import { beneficiariosMock } from '../data/mock';
import {
  listarOportunidadesEficiencia,
  type TipoOportunidade,
} from '../utils/efficiency';

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

const ORDEM_TIPOS: TipoOportunidade[] = [
  'PA evitável',
  'Exame com possível redundância',
  'Consulta com baixa resolutividade',
  'Repetição assistencial',
];

const ITENS_POR_PAGINA = 10;

export default function EficienciaAssistencialPage() {
  const router = useRouter();
  const autorizado = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('auth-status') === 'authenticated',
    () => false
  );

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoOportunidade | ''>('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    if (!autorizado) router.replace('/login');
  }, [autorizado, router]);

  const oportunidades = useMemo(
    () => listarOportunidadesEficiencia(beneficiariosMock),
    []
  );

  const filtradas = useMemo(
    () =>
      !tipoSelecionado
        ? oportunidades
        : oportunidades.filter((item) => item.tipo === tipoSelecionado),
    [oportunidades, tipoSelecionado]
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [tipoSelecionado]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const oportunidadesPaginadas = filtradas.slice(indiceInicial, indiceFinal);
  const inicioItem = filtradas.length === 0 ? 0 : indiceInicial + 1;
  const fimItem = filtradas.length === 0 ? 0 : Math.min(indiceFinal, filtradas.length);

  const totais = useMemo(
    () => ({
      totalCusto: oportunidades.reduce((soma, item) => soma + item.custo, 0),
      totalEventos: oportunidades.length,
      totalBeneficiarios: new Set(oportunidades.map((item) => item.beneficiarioId)).size,
      percentual: Math.round((new Set(oportunidades.map((item) => item.beneficiarioId)).size / beneficiariosMock.length) * 100),
    }),
    [oportunidades]
  );

  const porTipo = useMemo(() => {
    const mapa = new Map<TipoOportunidade, { quantidade: number; custo: number }>();

    ORDEM_TIPOS.forEach((tipo) => {
      mapa.set(tipo, { quantidade: 0, custo: 0 });
    });

    oportunidades.forEach((item) => {
      const atual = mapa.get(item.tipo)!;
      atual.quantidade += 1;
      atual.custo += item.custo;
      mapa.set(item.tipo, atual);
    });

    return ORDEM_TIPOS.map((tipo) => ({
      tipo,
      quantidade: mapa.get(tipo)!.quantidade,
      custo: mapa.get(tipo)!.custo,
    }));
  }, [oportunidades]);

  const maxCusto = Math.max(...porTipo.map((item) => item.custo), 1);

  const dominante = useMemo(
    () => [...porTipo].sort((a, b) => b.custo - a.custo)[0],
    [porTipo]
  );

  const insightAutomatico = useMemo(() => {
    if (!dominante || dominante.quantidade === 0) {
      return 'Não há dados suficientes para leitura automática no momento.';
    }

    if (dominante.tipo === 'PA evitável') {
      return 'A maior concentração de custo está associada a uso recorrente de pronto atendimento dentro da janela crítica definida para o módulo.';
    }

    if (dominante.tipo === 'Exame com possível redundância') {
      return 'Há massa relevante de exames com repetição real de um mesmo exame em janela clínica curta, sugerindo oportunidade concreta de revisar indicação e protocolo.';
    }

    if (dominante.tipo === 'Consulta com baixa resolutividade') {
      return 'Consultas em sequência com manutenção de criticidade operacional indicam oportunidade de centralizar cuidado e melhorar resolutividade clínica.';
    }

    return 'A repetição assistencial está concentrada na janela fixa de 30 dias, apontando oportunidade de coordenação e prevenção mais próximas.';
  }, [dominante]);

  if (!autorizado) return null;

  return (
    <AppShell active={'eficiencia' as any}>
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <PageHeader
            eyebrow="Gestão de custo assistencial"
            title="Eficiência Assistencial"
            description="Identifica oportunidades coerentes com o histórico real do beneficiário, sem duplicar a visão geral da tela de beneficiários."
          />
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Custo potencial evitável</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{moeda(totais.totalCusto)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Casos com oportunidade</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.totalEventos}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Beneficiários impactados</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.totalBeneficiarios}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">% da base com oportunidade</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totais.percentual}%</p>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6">
            <PageHeader
              eyebrow="Visão analítica"
              title="Distribuição do custo evitável por tipo"
              meta={
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{moeda(totais.totalCusto)}</p>
                </div>
              }
            />
            <div className="mt-6 space-y-4">
              {porTipo.map((item) => {
                const width = item.custo === 0 ? 0 : Math.round((item.custo / maxCusto) * 100);
                return (
                  <div key={item.tipo}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-900">{item.tipo}</span>
                      <span className="text-sm text-slate-600">{moeda(item.custo)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-emerald-600">Insight automático</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Maior concentração de custo</h2>
            <p className="mt-3 text-sm text-slate-700">{insightAutomatico}</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tipo dominante</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{dominante?.tipo ?? '-'}</p>
            </div>
          </Card>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {porTipo.map((item) => (
            <button
              key={item.tipo}
              type="button"
              onClick={() => setTipoSelecionado((atual) => (atual === item.tipo ? '' : item.tipo))}
              className={`rounded-2xl border p-5 text-left shadow-sm transition-colors duration-150 ${
                tipoSelecionado === item.tipo
                  ? 'border-emerald-300 bg-emerald-100 ring-2 ring-emerald-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-medium text-slate-700">{item.tipo}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.quantidade}</p>
              <p className="mt-2 text-sm text-slate-600">{moeda(item.custo)}</p>
            </button>
          ))}
        </section>

        <Card padded={false}>
          <TableTitle
            title="Oportunidades de otimização"
            subtitle="Oportunidades identificadas a partir de padrões de uso, redundância assistencial e baixa resolutividade, priorizadas por impacto clínico e potencial de redução de custo."
          />
          <TableWrapper>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-500">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Tipo de oportunidade</th>
                  <th className="px-6 py-4">Frequência</th>
                  <th className="px-6 py-4">Custo estimado</th>
                  <th className="px-6 py-4">Impacto</th>
                  <th className="px-6 py-4">Ação sugerida</th>
                </tr>
              </thead>
              <tbody>
                {oportunidadesPaginadas.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/eficiencia/${item.beneficiarioId}`)}
                    className="group cursor-pointer border-t border-slate-100 align-top transition hover:bg-emerald-50/60 focus-visible:bg-emerald-50/60 focus-visible:outline-none"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 transition-colors group-hover:text-emerald-700">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getEfficiencyBadgeVariant(item.tipo)}>{item.tipo}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.frequencia}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{moeda(item.custo)}</td>
                    <td className="px-6 py-4 text-slate-600">{item.impacto}%</td>
                    <td className="px-6 py-4 text-slate-600">{item.acao}</td>
                  </tr>
                ))}
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhuma oportunidade encontrada para o filtro selecionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </TableWrapper>

          <TableFooter
            from={inicioItem}
            to={fimItem}
            total={filtradas.length}
            page={paginaSegura}
            totalPages={totalPaginas}
            onPageChange={setPaginaAtual}
            label="oportunidade(s)."
          />
        </Card>
      </div>
    </AppShell>
  );
}
