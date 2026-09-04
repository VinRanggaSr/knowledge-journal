import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

interface AppShellProps {
  children: ReactNode;
}

function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-5xl min-w-0 p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

export default AppShell;
