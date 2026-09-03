import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-16 text-center', className)}>
      <div className="rounded-[22px] border border-border bg-[#eeeeec] p-1.5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 inline-flex items-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
