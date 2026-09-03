import { NavLink, useNavigate } from 'react-router-dom';
import { BookText, Plus, Search, Tags as TagsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface px-4 py-2 md:hidden">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium text-muted-foreground',
            isActive && 'text-foreground',
          )
        }
      >
        <BookText className="h-5 w-5" />
        Timeline
      </NavLink>

      <NavLink
        to="/knowledge"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium text-muted-foreground',
            isActive && 'text-foreground',
          )
        }
      >
        <Search className="h-5 w-5" />
        Knowledge
      </NavLink>

      <button
        type="button"
        onClick={() => navigate('/knowledge/new')}
        aria-label="Tambah knowledge"
        className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-foreground text-white shadow-md"
      >
        <Plus className="h-5 w-5" />
      </button>

      <NavLink
        to="/tags"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium text-muted-foreground',
            isActive && 'text-foreground',
          )
        }
      >
        <TagsIcon className="h-5 w-5" />
        Tags
      </NavLink>
    </nav>
  );
}

export default BottomNav;
