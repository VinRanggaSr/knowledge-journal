import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Repeat, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import EmptyState from '@/components/EmptyState';
import FormDialog from '@/components/goals/FormDialog';
import { createAction, deleteAction, listActions, updateAction } from '@/services/api/goalsApi';
import type { Action } from '@/types';

const iconButton = 'rounded-full p-1.5 text-muted-foreground hover:bg-background';

function ActionsTab() {
  const queryClient = useQueryClient();
  const { data: actions = [], isLoading } = useQuery({ queryKey: ['actions'], queryFn: listActions });
  const [dialog, setDialog] = useState<{ action?: Action } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['actions'] });
  const closeAfter = { onSuccess: () => { refresh(); setDialog(null); } };

  const createMutation = useMutation({ mutationFn: createAction, ...closeAfter });
  const updateMutation = useMutation({ mutationFn: updateAction, ...closeAfter });
  const toggleMutation = useMutation({ mutationFn: updateAction, onSuccess: refresh });
  const deleteMutation = useMutation({
    mutationFn: deleteAction,
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ['actionLogs'] });
    },
  });

  function handleDelete(action: Action) {
    if (window.confirm(`Hapus action "${action.title}"? Riwayat checklist-nya juga ikut terhapus.`)) {
      deleteMutation.mutate({ id: action.id });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Hal-hal yang kamu lakukan untuk mewujudkan goals.</p>
        <Button size="sm" onClick={() => setDialog({})}>
          <Plus className="h-4 w-4" />
          Tambah Action
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && actions.length === 0 && (
        <EmptyState
          icon={Zap}
          title="Belum ada action"
          description="Tambah action pertama, lalu aktifkan switch jika dilakukan setiap hari."
          action={{ label: 'Tambah Action', onClick: () => setDialog({}) }}
        />
      )}

      {actions.length > 0 && (
        <div className="rounded-[30px] border border-border bg-[#eeeeec] p-1.5">
          <ul className="flex flex-col rounded-3xl bg-surface px-4 py-2">
            {actions.map((action) => (
              <li
                key={action.id}
                className="flex items-center justify-between gap-3 border-t border-dashed border-border py-3 first:border-t-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="min-w-0 break-words text-sm font-medium">{action.title}</span>
                  {action.isDaily && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Repeat className="h-3 w-3" />
                      Setiap hari
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={action.isDaily}
                    onCheckedChange={(isDaily) =>
                      toggleMutation.mutate({ id: action.id, title: action.title, isDaily })
                    }
                  />
                  <button type="button" aria-label="Edit action" className={iconButton} onClick={() => setDialog({ action })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Hapus action" className={iconButton} onClick={() => handleDelete(action)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog?.action ? 'Edit Action' : 'Tambah Action'}
        label="Action"
        placeholder="mis. Baca buku minimal sehari sebelembar"
        initial={{ text: dialog?.action?.title, isDaily: dialog?.action?.isDaily }}
        withDailySwitch
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={({ text, isDaily }) =>
          dialog?.action
            ? updateMutation.mutate({ id: dialog.action.id, title: text, isDaily })
            : createMutation.mutate({ title: text, isDaily })
        }
      />
    </div>
  );
}

export default ActionsTab;
