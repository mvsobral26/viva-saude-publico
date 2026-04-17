'use client';

import { useRouter } from 'next/navigation';

export default function Topbar() {
  const router = useRouter();

  function handleLogout() {
    sessionStorage.removeItem('auth-status');
    sessionStorage.removeItem('auth-identificador');
    router.push('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-sm font-medium text-slate-500">Bem-vindo ao Painel Viva+ Saúde</p>
        <p className="text-xs text-slate-400">Assistente analítico habilitado no ambiente</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Ambiente autenticado
        </span>

        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
