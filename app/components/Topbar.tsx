export default function Topbar() {
  return (
    <header className="flex min-h-16 min-w-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">Bem-vindo ao Painel Viva+ Saúde</p>
        <p className="truncate text-xs text-slate-400">Assistente analítico habilitado no ambiente</p>
      </div>

      <div className="flex min-w-0 items-center justify-start gap-3 xl:justify-end">
        <span className="inline-flex max-w-full items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Ambiente autenticado
        </span>
      </div>
    </header>
  );
}
