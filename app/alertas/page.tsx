'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../components/AppShell';
import TableFooter from '../components/TableFooter';
import Badge, { getRiskBadgeVariant } from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { Field, SelectInput } from '../components/FormField';
import PageHeader from '../components/PageHeader';
import { TableTitle, TableWrapper } from '../components/Table';
import { beneficiariosMock } from '../data/mock';
import { gerarAlertas } from '../utils/alerts';

type Severidade = 'Crítico' | 'Alto' | 'Médio' | 'Baixo';

const ITENS_POR_PAGINA = 10;

const prioridadeSeveridade: Record<Severidade, number> = {
  Crítico: 4,
  Alto: 3,
  Médio: 2,
  Baixo: 1,
};

function getSeveridadeClasses(severidade: Severidade) {
  if (severidade === 'Crítico') return 'bg-red-500';
  if (severidade === 'Alto') return 'bg-orange-500';
  if (severidade === 'Médio') return 'bg-amber-400';
  return 'bg-emerald-500';
}

function formatarCPF(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export default function AlertasPage() {
  const router = useRouter();
  const [alertaSelecionado, setAlertaSelecionado] = useState('');
  const [severidadeSelecionada, setSeveridadeSelecionada] = useState<Severidade | ''>('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const autorizado = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('auth-status') === 'authenticated',
    () => false
  );

  useEffect(() => {
    if (!autorizado) router.replace('/login');
  }, [autorizado, router]);

  const beneficiariosComAlertas = useMemo(
    () =>
      beneficiariosMock.map((beneficiario) => ({
        ...beneficiario,
        alertasGerados: gerarAlertas(beneficiario),
      })),
    []
  );

  const beneficiariosComSeveridadeDominante = useMemo(() => {
    return beneficiariosComAlertas.map((beneficiario) => {
      const severidadeDominante =
        [...beneficiario.alertasGerados].sort(
          (a, b) =>
            prioridadeSeveridade[b.tipo as Severidade] -
            prioridadeSeveridade[a.tipo as Severidade]
        )[0]?.tipo ?? 'Baixo';

      return {
        ...beneficiario,
        severidadeDominante: severidadeDominante as Severidade,
      };
    });
  }, [beneficiariosComAlertas]);

  const alertasDisponiveis = useMemo(() => {
    const lista = beneficiariosComAlertas.flatMap((beneficiario) =>
      beneficiario.alertasGerados.map((alerta) => ({
        mensagem: alerta.mensagem,
        tipo: alerta.tipo as Severidade,
      }))
    );
    const unicos = new Map<string, Severidade>();
    lista.forEach((item) => {
      if (!unicos.has(item.mensagem)) unicos.set(item.mensagem, item.tipo);
    });

    return Array.from(unicos.entries())
      .map(([mensagem, tipo]) => ({ mensagem, tipo }))
      .filter((item) => (severidadeSelecionada ? item.tipo === severidadeSelecionada : true))
      .sort((a, b) => a.mensagem.localeCompare(b.mensagem, 'pt-BR'));
  }, [beneficiariosComAlertas, severidadeSelecionada]);

  const totaisPorSeveridade = useMemo(() => {
    return {
      critico: beneficiariosComSeveridadeDominante.filter(
        (beneficiario) => beneficiario.severidadeDominante === 'Crítico'
      ).length,
      alto: beneficiariosComSeveridadeDominante.filter(
        (beneficiario) => beneficiario.severidadeDominante === 'Alto'
      ).length,
      medio: beneficiariosComSeveridadeDominante.filter(
        (beneficiario) => beneficiario.severidadeDominante === 'Médio'
      ).length,
      baixo: beneficiariosComSeveridadeDominante.filter(
        (beneficiario) => beneficiario.severidadeDominante === 'Baixo'
      ).length,
    };
  }, [beneficiariosComSeveridadeDominante]);

  const totalOcorrencias = useMemo(
    () => beneficiariosComAlertas.flatMap((beneficiario) => beneficiario.alertasGerados).length,
    [beneficiariosComAlertas]
  );

  const totalAlertasConsolidados =
    totaisPorSeveridade.critico +
    totaisPorSeveridade.alto +
    totaisPorSeveridade.medio +
    totaisPorSeveridade.baixo;

  const dadosGrafico = useMemo(() => {
    const itens = [
      { label: 'Crítico', valor: totaisPorSeveridade.critico, tipo: 'Crítico' as Severidade },
      { label: 'Alto', valor: totaisPorSeveridade.alto, tipo: 'Alto' as Severidade },
      { label: 'Médio', valor: totaisPorSeveridade.medio, tipo: 'Médio' as Severidade },
      { label: 'Baixo', valor: totaisPorSeveridade.baixo, tipo: 'Baixo' as Severidade },
    ];

    const maximo = Math.max(...itens.map((item) => item.valor), 1);

    return itens.map((item) => ({
      ...item,
      percentual: Math.round((item.valor / maximo) * 100),
      participacao:
        totalAlertasConsolidados > 0
          ? Math.round((item.valor / totalAlertasConsolidados) * 100)
          : 0,
    }));
  }, [totaisPorSeveridade, totalAlertasConsolidados]);

  const severidadeDominante = useMemo(
    () => [...dadosGrafico].sort((a, b) => b.valor - a.valor)[0],
    [dadosGrafico]
  );

  const insightAutomatico = useMemo(() => {
    if (!severidadeDominante) {
      return 'Não há dados suficientes para gerar insight no momento.';
    }

    if (severidadeDominante.label === 'Crítico') {
      return 'Os alertas críticos predominam na leitura consolidada, sugerindo necessidade de atuação assistencial imediata.';
    }

    if (severidadeDominante.label === 'Alto') {
      return 'Os alertas altos predominam, indicando volume relevante de casos que exigem atenção rápida.';
    }

    if (severidadeDominante.label === 'Médio') {
      return 'Os alertas médios concentram a maior parte do cenário, o que sugere oportunidade de prevenção para evitar agravamento.';
    }

    return 'O cenário está mais concentrado em alertas baixos, indicando base relevante de perfis estáveis com foco preventivo.';
  }, [severidadeDominante]);

  const beneficiariosFiltrados = useMemo(() => {
    if (severidadeSelecionada && !alertaSelecionado) {
      return beneficiariosComAlertas.filter((beneficiario) =>
        beneficiario.alertasGerados.some((alerta) => alerta.tipo === severidadeSelecionada)
      );
    }

    if (alertaSelecionado) {
      return beneficiariosComAlertas.filter((beneficiario) =>
        beneficiario.alertasGerados.some((alerta) => alerta.mensagem === alertaSelecionado)
      );
    }

    return [];
  }, [beneficiariosComAlertas, severidadeSelecionada, alertaSelecionado]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [severidadeSelecionada, alertaSelecionado]);

  const totalPaginas = Math.max(1, Math.ceil(beneficiariosFiltrados.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const beneficiariosPaginados = beneficiariosFiltrados.slice(indiceInicial, indiceFinal);
  const inicioItem = beneficiariosFiltrados.length === 0 ? 0 : indiceInicial + 1;
  const fimItem =
    beneficiariosFiltrados.length === 0
      ? 0
      : Math.min(indiceFinal, beneficiariosFiltrados.length);

  if (!autorizado) return null;

  return (
    <AppShell active="alertas">
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6">
            <PageHeader
              eyebrow="Leitura executiva"
              title="Distribuição dos alertas"
              description="Visão consolidada dos alertas por severidade dominante para leitura rápida do cenário."
              meta={
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Alertas distribuídos
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {totalAlertasConsolidados}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {totalOcorrencias} ocorrências totais
                  </p>
                </div>
              }
            />

            <div className="mt-6 space-y-4">
              {dadosGrafico.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${getSeveridadeClasses(item.tipo)}`} />
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    </div>

                    <div className="text-right text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{item.valor}</span> ·{' '}
                      {item.participacao}%
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${getSeveridadeClasses(item.tipo)}`}
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-emerald-600">Insight automático</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Maior concentração de risco</h2>
            <p className="mt-3 text-sm text-slate-700">{insightAutomatico}</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Severidade dominante
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {severidadeDominante?.label ?? '-'}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {severidadeDominante?.participacao ?? 0}% da leitura consolidada de alertas
              </p>
            </div>
          </Card>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setSeveridadeSelecionada('Crítico');
              setAlertaSelecionado('');
            }}
            className={`rounded-2xl border p-5 text-left shadow-sm transition ${
              severidadeSelecionada === 'Crítico'
                ? 'border-red-400 bg-red-100 ring-2 ring-red-200'
                : 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100/60'
            }`}
          >
            <p className="text-sm font-medium text-red-700">Alertas críticos</p>
            <p className="mt-2 text-3xl font-bold text-red-800">{totaisPorSeveridade.critico}</p>
            <p className="mt-2 text-sm text-red-700">Maior urgência assistencial</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeveridadeSelecionada('Alto');
              setAlertaSelecionado('');
            }}
            className={`rounded-2xl border p-5 text-left shadow-sm transition ${
              severidadeSelecionada === 'Alto'
                ? 'border-orange-400 bg-orange-100 ring-2 ring-orange-200'
                : 'border-orange-200 bg-orange-50 hover:border-orange-300 hover:bg-orange-100/60'
            }`}
          >
            <p className="text-sm font-medium text-orange-700">Alertas altos</p>
            <p className="mt-2 text-3xl font-bold text-orange-800">{totaisPorSeveridade.alto}</p>
            <p className="mt-2 text-sm text-orange-700">Exigem atenção rápida</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeveridadeSelecionada('Médio');
              setAlertaSelecionado('');
            }}
            className={`rounded-2xl border p-5 text-left shadow-sm transition ${
              severidadeSelecionada === 'Médio'
                ? 'border-amber-400 bg-amber-100 ring-2 ring-amber-200'
                : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/60'
            }`}
          >
            <p className="text-sm font-medium text-amber-700">Alertas médios</p>
            <p className="mt-2 text-3xl font-bold text-amber-800">{totaisPorSeveridade.medio}</p>
            <p className="mt-2 text-sm text-amber-700">Monitoramento preventivo</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeveridadeSelecionada('Baixo');
              setAlertaSelecionado('');
            }}
            className={`rounded-2xl border p-5 text-left shadow-sm transition ${
              severidadeSelecionada === 'Baixo'
                ? 'border-emerald-400 bg-emerald-100 ring-2 ring-emerald-200'
                : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100/60'
            }`}
          >
            <p className="text-sm font-medium text-emerald-700">Alertas baixos</p>
            <p className="mt-2 text-3xl font-bold text-emerald-800">{totaisPorSeveridade.baixo}</p>
            <p className="mt-2 text-sm text-emerald-700">Perfis estáveis</p>
          </button>
        </section>

        <Card className="p-6">
          <PageHeader
            eyebrow="Monitoramento operacional"
            title="Alertas"
            description="Clique em uma severidade no topo para ver todos os beneficiários da categoria ou refine pela combo escolhendo um alerta específico."
            actions={
              severidadeSelecionada ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSeveridadeSelecionada('');
                    setAlertaSelecionado('');
                  }}
                >
                  Limpar filtro de severidade
                </Button>
              ) : undefined
            }
          />

          <div className="mt-6 max-w-3xl">
            <Field label="Selecionar alerta">
              <SelectInput
                value={alertaSelecionado}
                onChange={(e) => setAlertaSelecionado(e.target.value)}
              >
                <option value="">Selecione um alerta</option>
                {alertasDisponiveis.map((alerta) => (
                  <option key={alerta.mensagem} value={alerta.mensagem}>
                    {alerta.mensagem}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </Card>

        <Card padded={false}>
          <TableTitle
            title={
              alertaSelecionado
                ? 'Beneficiários com o alerta selecionado'
                : severidadeSelecionada
                ? 'Beneficiários com alertas da severidade selecionada'
                : 'Beneficiários filtrados'
            }
            subtitle={
              alertaSelecionado
                ? 'Relação completa dos beneficiários associados ao alerta atual.'
                : severidadeSelecionada
                ? 'Relação completa dos beneficiários que possuem ao menos um alerta dessa categoria.'
                : 'Selecione uma severidade ou um alerta específico para visualizar os beneficiários.'
            }
          />

          <TableWrapper>
            <table className="w-full table-fixed text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-500">
                  <th className="w-[18%] px-6 py-4">Nome</th>
                  <th className="w-[13%] px-6 py-4">CPF</th>
                  <th className="w-[11%] px-6 py-4">Área</th>
                  <th className="w-[11%] px-6 py-4">Health Score</th>
                  <th className="w-[10%] px-6 py-4">Risco</th>
                  <th className="w-[18%] px-6 py-4">Status</th>
                  <th className="w-[19%] px-6 py-4">Condição</th>
                </tr>
              </thead>

              <tbody>
                {beneficiariosPaginados.map((beneficiario) => (
                  <tr
                    key={beneficiario.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => router.push(`/beneficiarios/${beneficiario.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        router.push(`/beneficiarios/${beneficiario.id}`);
                      }
                    }}
                    className="group cursor-pointer border-t border-slate-100 align-top transition hover:bg-emerald-50/60 focus-visible:bg-emerald-50/60 focus-visible:outline-none"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 transition-colors group-hover:text-emerald-700 group-focus-visible:text-emerald-700">
                      {beneficiario.nome}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatarCPF(beneficiario.cpf)}</td>
                    <td className="px-6 py-4 text-slate-600">{beneficiario.area}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{beneficiario.score}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getRiskBadgeVariant(beneficiario.risco)}>
                        {beneficiario.risco}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{beneficiario.status}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="truncate" title={beneficiario.condicao}>
                        {beneficiario.condicao}
                      </div>
                    </td>
                  </tr>
                ))}

                {!severidadeSelecionada && !alertaSelecionado ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Nenhum filtro selecionado.
                    </td>
                  </tr>
                ) : null}

                {(severidadeSelecionada || alertaSelecionado) &&
                beneficiariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Nenhum beneficiário encontrado para o filtro selecionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </TableWrapper>

          <TableFooter
            from={inicioItem}
            to={fimItem}
            total={beneficiariosFiltrados.length}
            page={paginaSegura}
            totalPages={totalPaginas}
            onPageChange={setPaginaAtual}
            label="beneficiário(s)."
          />
        </Card>
      </div>
    </AppShell>
  );
}
