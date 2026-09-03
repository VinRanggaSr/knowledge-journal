import { NavLink } from 'react-router-dom';
import { BookText, LogOut, Search, Tags as TagsIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';
import { STORAGE_KEY } from '@/components/PasswordGate';

const navItems = [
  { to: '/', label: 'Timeline', icon: BookText, end: true },
  { to: '/knowledge', label: 'Knowledge', icon: Search, end: false },
  { to: '/tags', label: 'Tags', icon: TagsIcon, end: false },
];

function Sidebar() {
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);

  function handleLogout() {
    if (window.confirm('Keluar dari Knowledge Journal?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-background md:p-6">
      <div className="mb-8 text-lg font-semibold">Knowledge Journal</div>
      <Button onClick={openQuickAdd} variant="outline" className="mb-6">
        <Plus className="h-4 w-4" />
        Tambah Knowledge
      </Button>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-border',
                isActive && 'bg-border text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-border"
      >
        <LogOut className="h-4 w-4" />
        Keluar
      </button>
    </aside>
  );
}

export default Sidebar;
