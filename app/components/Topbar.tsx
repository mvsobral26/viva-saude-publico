export default function Topbar() {
  return (
    <header className="flex min-w-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">Bem-vindo ao Painel Viva+ Saúde</p>
        <p className="truncate text-xs text-slate-400">Assistente analítico habilitado no ambiente</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Ambiente autenticado
        </span>
      </div>
    </header>
  );
}
