import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import QuickAddSheet from '@/components/QuickAddSheet';

interface AppShellProps {
  children: ReactNode;
}

function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <main className="mx-auto max-w-5xl p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav />
      <QuickAddSheet />
    </div>
  );
}

export default AppShell;
