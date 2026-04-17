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

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6">
      <div className="mb-8 px-2">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Viva+ Saúde
        </div>
        <h1 className="mt-2 text-2xl font-bold text-white">Painel Inteligente</h1>

        <p className="mt-2 text-sm text-slate-400">
          Gestão de beneficiários, risco assistencial, eficiência e monitoramento clínico.
        </p>
      </div>

      <nav className="flex flex-col gap-2">
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

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Ambiente Seguro
        </p>
        <p className="mt-2 text-sm font-medium text-white">Operação Viva+ autenticada</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Navegação protegida por autenticação em dois fatores
        </p>
      </div>
    </aside>
  );
}
