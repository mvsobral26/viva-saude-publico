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
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar active={active} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
