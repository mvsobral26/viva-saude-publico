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
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100">
      <div className="flex min-h-screen w-full min-w-0">
        <Sidebar active={active} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Topbar />
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
