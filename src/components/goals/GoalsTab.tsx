import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import FormDialog from '@/components/goals/FormDialog';
import {
  createGoal,
  createGoalItem,
  deleteGoal,
  deleteGoalItem,
  listGoals,
  updateGoal,
  updateGoalItem,
} from '@/services/api/goalsApi';
import type { Goal, GoalItem } from '@/types';

type DialogState =
  | { type: 'goal'; goal?: Goal }
  | { type: 'item'; goal: Goal; item?: GoalItem }
  | null;

const iconButton = 'rounded-full p-1.5 text-muted-foreground hover:bg-background';

function GoalsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['goals'], queryFn: listGoals });
  const [dialog, setDialog] = useState<DialogState>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['goals'] });
  const closeAfter = { onSuccess: () => { refresh(); setDialog(null); } };

  const createGoalMutation = useMutation({ mutationFn: createGoal, ...closeAfter });
  const updateGoalMutation = useMutation({ mutationFn: updateGoal, ...closeAfter });
  const deleteGoalMutation = useMutation({ mutationFn: deleteGoal, onSuccess: refresh });
  const createItemMutation = useMutation({ mutationFn: createGoalItem, ...closeAfter });
  const updateItemMutation = useMutation({ mutationFn: updateGoalItem, ...closeAfter });
  const deleteItemMutation = useMutation({ mutationFn: deleteGoalItem, onSuccess: refresh });

  const goals = data?.goals ?? [];
  const items = data?.items ?? [];
  const isSaving =
    createGoalMutation.isPending ||
    updateGoalMutation.isPending ||
    createItemMutation.isPending ||
    updateItemMutation.isPending;

  function handleDeleteGoal(goal: Goal) {
    if (window.confirm(`Hapus section "${goal.title}" beserta semua goals di dalamnya?`)) {
      deleteGoalMutation.mutate({ id: goal.id });
    }
  }

  function handleDeleteItem(item: GoalItem) {
    if (window.confirm(`Hapus goal "${item.text}"?`)) {
      deleteItemMutation.mutate({ id: item.id });
    }
  }

  function handleSubmit(text: string) {
    if (!dialog) return;
    if (dialog.type === 'goal') {
      if (dialog.goal) updateGoalMutation.mutate({ id: dialog.goal.id, title: text });
      else createGoalMutation.mutate({ title: text });
    } else if (dialog.item) {
      updateItemMutation.mutate({ id: dialog.item.id, text });
    } else {
      createItemMutation.mutate({ goalId: dialog.goal.id, text });
    }
  }

  const dialogConfig =
    dialog?.type === 'goal'
      ? {
          title: dialog.goal ? 'Edit Section' : 'Tambah Section',
          label: 'Judul section',
          placeholder: 'mis. 2 Tahun - 2028',
          initial: dialog.goal?.title,
        }
      : {
          title: dialog?.item ? 'Edit Goal' : 'Tambah Goal',
          label: 'Goal',
          placeholder: 'mis. Net worth > $200k USD',
          initial: dialog?.item?.text,
        };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Dreams & goals yang ingin kamu capai.</p>
        <Button size="sm" onClick={() => setDialog({ type: 'goal' })}>
          <Plus className="h-4 w-4" />
          Tambah Section
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && goals.length === 0 && (
        <EmptyState
          icon={Target}
          title="Belum ada dreams & goals"
          description="Buat section pertama, mis. target 2 tahun ke depan."
          action={{ label: 'Tambah Section', onClick: () => setDialog({ type: 'goal' }) }}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const goalItems = items.filter((i) => i.goalId === goal.id);
          return (
            <div key={goal.id} className="rounded-[30px] border border-border bg-[#eeeeec] p-1.5">
              <div className="flex h-full flex-col gap-3 rounded-3xl bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <div className="flex shrink-0 items-center">
                    <button type="button" aria-label="Edit section" className={iconButton} onClick={() => setDialog({ type: 'goal', goal })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="Hapus section" className={iconButton} onClick={() => handleDeleteGoal(goal)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <ul className="flex flex-col">
                  {goalItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 border-t border-dashed border-border py-2 text-sm first:border-t-0"
                    >
                      <span className="min-w-0 break-words">{item.text}</span>
                      <div className="flex shrink-0 items-center">
                        <button type="button" aria-label="Edit goal" className={iconButton} onClick={() => setDialog({ type: 'item', goal, item })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" aria-label="Hapus goal" className={iconButton} onClick={() => handleDeleteItem(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setDialog({ type: 'item', goal })}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-background"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Goal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialogConfig.title}
        label={dialogConfig.label}
        placeholder={dialogConfig.placeholder}
        initial={{ text: dialogConfig.initial }}
        isSaving={isSaving}
        onSubmit={({ text }) => handleSubmit(text)}
      />
    </div>
  );
}

export default GoalsTab;
