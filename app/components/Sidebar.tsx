'use client';

import Link from 'next/link';

type SidebarProps = {
  active?: 'dashboard' | 'beneficiarios' | 'alertas' | 'eficiencia';
};

export default function Sidebar({ active = 'dashboard' }: SidebarProps) {
  const itemClass = (isActive: boolean) =>
    `block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-800 bg-slate-950 px-4 py-6 xl:flex xl:flex-col">
      <div className="mb-8 min-w-0 px-2">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Viva+ Saúde
        </div>
        <h1 className="mt-2 text-2xl font-bold text-white">Painel Inteligente</h1>

        <p className="mt-2 text-sm text-slate-400">
          Gestão de beneficiários, risco assistencial, eficiência e monitoramento clínico.
        </p>
      </div>

      <nav className="flex min-w-0 flex-col gap-2">
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
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
