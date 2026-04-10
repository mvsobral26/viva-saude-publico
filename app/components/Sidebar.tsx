'use client';

import Link from 'next/link';

type SidebarProps = {
  active?: 'dashboard' | 'beneficiarios' | 'alertas' | 'eficiencia';
};

export default function Sidebar({ active = 'dashboard' }: SidebarProps) {
  const itemClass = (isActive: boolean) =>
    `inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
      isActive
        ? 'bg-emerald-600 text-white shadow'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  function handleLogout() {
    sessionStorage.removeItem('auth-status');
    sessionStorage.removeItem('auth-identificador');
    window.location.href = '/login';
  }

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 px-4 py-4 lg:min-h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
      <div className="lg:mb-8 lg:px-2">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Viva+ Saúde
        </div>
        <h1 className="mt-2 text-xl font-bold text-white lg:text-2xl">Painel Inteligente</h1>

        <p className="mt-2 hidden text-sm text-slate-400 lg:block">
          Gestão de beneficiários, risco assistencial, eficiência e monitoramento clínico.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:mt-0 lg:h-[calc(100%-7rem)] lg:justify-between">
        <nav className="-mx-1 overflow-x-auto pb-1 lg:mx-0 lg:overflow-visible lg:pb-0">
          <div className="flex min-w-max gap-2 px-1 lg:min-w-0 lg:flex-col lg:px-0">
            <Link href="/" className={itemClass(active === 'dashboard')}>
              Dashboard
            </Link>

            <Link href="/beneficiarios" className={itemClass(active === 'beneficiarios')}>
              Beneficiários
            </Link>

            <Link href="/alertas" className={itemClass(active === 'alertas')}>
              Alertas
            </Link>

            <Link href="/eficiencia" className={itemClass(active === 'eficiencia')}>
              Eficiência Assistencial
            </Link>
          </div>
        </nav>

        <div className="pt-0 lg:pt-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
