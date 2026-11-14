import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { Check, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ConsistencyChart from '@/components/goals/ConsistencyChart';
import { listActionLogs, listActions, setActionLog } from '@/services/api/goalsApi';
import { dailyActionsOn } from '@/lib/consistency';
import { formatDateLabel } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';
import type { ActionLog } from '@/types';

function ChecklistTab() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);

  const { data: actions = [], isLoading: loadingActions } = useQuery({ queryKey: ['actions'], queryFn: listActions });
  const { data: logs = [], isLoading: loadingLogs } = useQuery({ queryKey: ['actionLogs'], queryFn: listActionLogs });

  const toggleMutation = useMutation({
    mutationFn: setActionLog,
    onMutate: async ({ date: d, actionId, done }) => {
      await queryClient.cancelQueries({ queryKey: ['actionLogs'] });
      const previous = queryClient.getQueryData<ActionLog[]>(['actionLogs']);
      queryClient.setQueryData<ActionLog[]>(['actionLogs'], (old = []) => {
        const rest = old.filter((l) => !(l.date === d && l.actionId === actionId));
        return done ? [...rest, { date: d, actionId }] : rest;
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['actionLogs'], context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['actionLogs'] }),
  });

  const dayActions = useMemo(() => dailyActionsOn(actions, date), [actions, date]);
  const doneIds = useMemo(() => new Set(logs.filter((l) => l.date === date).map((l) => l.actionId)), [logs, date]);
  const doneCount = dayActions.filter((a) => doneIds.has(a.id)).length;
  const isLoading = loadingActions || loadingLogs;
  const hasDaily = actions.some((a) => a.isDaily);

  function shiftDay(offset: number) {
    setDate(format(addDays(parseISO(date), offset), 'yyyy-MM-dd'));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className={cn('font-semibold', date !== today && 'capitalize')}>{date === today ? 'Hari ini' : formatDateLabel(date)}</h2>
            <p className="text-sm text-muted-foreground">
              {dayActions.length > 0 ? `${doneCount} dari ${dayActions.length} selesai` : 'Checklist harian'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Hari sebelumnya" onClick={() => shiftDay(-1)} className="rounded-full p-2 text-muted-foreground hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDate(today)}
              disabled={date === today}
              className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-background disabled:opacity-40"
            >
              Hari ini
            </button>
            <button type="button" aria-label="Hari berikutnya" onClick={() => shiftDay(1)} disabled={date >= today} className="rounded-full p-2 text-muted-foreground hover:bg-background disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

        {!isLoading && !hasDaily && (
          <EmptyState
            icon={ListChecks}
            title="Belum ada action harian"
            description='Aktifkan switch "setiap hari" pada tab Action untuk memunculkan checklist di sini.'
            compact
            className="py-8"
          />
        )}

        {dayActions.length > 0 && (
          <div className="rounded-[30px] border border-border bg-[#eeeeec] p-1.5">
            <ul className="flex flex-col rounded-3xl bg-surface px-4 py-2">
              {dayActions.map((action) => {
                const done = doneIds.has(action.id);
                return (
                  <li key={action.id} className="border-t border-dashed border-border first:border-t-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      onClick={() => toggleMutation.mutate({ date, actionId: action.id, done: !done })}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors',
                          done ? 'border-foreground bg-foreground text-white' : 'border-border bg-surface',
                        )}
                      >
                        {done && <Check className="h-4 w-4" />}
                      </span>
                      <span className={cn('min-w-0 break-words text-sm', done && 'text-muted-foreground line-through')}>
                        {action.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Konsistensi</h2>
        <div className="rounded-[30px] border border-border bg-[#eeeeec] p-1.5">
          <div className="rounded-3xl bg-surface p-4">
            <ConsistencyChart actions={actions} logs={logs} today={today} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChecklistTab;
