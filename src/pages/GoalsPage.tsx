import { useSearchParams } from 'react-router-dom';
import ActionsTab from '@/components/goals/ActionsTab';
import ChecklistTab from '@/components/goals/ChecklistTab';
import GoalsTab from '@/components/goals/GoalsTab';
import SacrificesTab from '@/components/goals/SacrificesTab';
import { cn } from '@/lib/utils';

const TABS = [
  { value: 'goals', label: 'Goals', Component: GoalsTab },
  { value: 'sacrifices', label: 'Dikorbankan', Component: SacrificesTab },
  { value: 'actions', label: 'Action', Component: ActionsTab },
  { value: 'checklist', label: 'Track Activity', Component: ChecklistTab },
] as const;

function GoalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = TABS.find((t) => t.value === searchParams.get('tab')) ?? TABS[0];
  const ActiveTab = active.Component;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Goals & Action</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dreams, langkah nyata, dan konsistensi harianmu.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSearchParams({ tab: tab.value }, { replace: true })}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors',
              active.value === tab.value ? 'bg-foreground text-white' : 'bg-surface text-muted-foreground hover:bg-background',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveTab />
    </div>
  );
}

export default GoalsPage;
