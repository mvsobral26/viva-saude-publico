
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

type MenuAtivo = 'dashboard' | 'beneficiarios' | 'alertas' | 'eficiencia';

type AppShellProps = {
  children: ReactNode;
  active?: MenuAtivo;
};

export default function AppShell({ children, active = 'dashboard' }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar active={active} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
            <div className="mx-auto w-full max-w-[1720px] min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
