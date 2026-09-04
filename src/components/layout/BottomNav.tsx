import { NavLink } from 'react-router-dom';
import { BookText, LogOut, Search, Tags as TagsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STORAGE_KEY } from '@/components/PasswordGate';

const navItems = [
  { to: '/', label: 'Timeline', icon: BookText, end: true },
  { to: '/knowledge', label: 'Knowledge', icon: Search, end: false },
  { to: '/tags', label: 'Tags', icon: TagsIcon, end: false },
];

function BottomNav() {
  function handleLogout() {
    if (window.confirm('Keluar dari Knowledge Journal?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface px-4 py-2 md:hidden">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium text-muted-foreground',
              isActive && 'text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-8 w-10 items-center justify-center rounded-xl',
                  isActive && 'bg-border',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium text-red-600"
      >
        <span className="flex h-8 w-10 items-center justify-center rounded-xl">
          <LogOut className="h-5 w-5" />
        </span>
        Logout
      </button>
    </nav>
  );
}

export default BottomNav;
