import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeartHandshake, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import FormDialog from '@/components/goals/FormDialog';
import { createSacrifice, deleteSacrifice, listSacrifices, updateSacrifice } from '@/services/api/goalsApi';
import type { Sacrifice } from '@/types';

const iconButton = 'rounded-full p-1.5 text-muted-foreground hover:bg-background';

function SacrificesTab() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['sacrifices'], queryFn: listSacrifices });
  const [dialog, setDialog] = useState<{ item?: Sacrifice } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['sacrifices'] });
  const closeAfter = { onSuccess: () => { refresh(); setDialog(null); } };

  const createMutation = useMutation({ mutationFn: createSacrifice, ...closeAfter });
  const updateMutation = useMutation({ mutationFn: updateSacrifice, ...closeAfter });
  const deleteMutation = useMutation({ mutationFn: deleteSacrifice, onSuccess: refresh });

  function handleDelete(item: Sacrifice) {
    if (window.confirm(`Hapus "${item.text}"?`)) {
      deleteMutation.mutate({ id: item.id });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Hal-hal yang siap dikorbankan demi goals.</p>
        <Button size="sm" onClick={() => setDialog({})}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={HeartHandshake}
          title="Belum ada yang dikorbankan"
          description="Catat hal yang siap kamu lepas, mis. scroll TikTok atau waktu tidur."
          action={{ label: 'Tambah', onClick: () => setDialog({}) }}
        />
      )}

      {items.length > 0 && (
        <div className="rounded-[30px] border border-border bg-[#eeeeec] p-1.5">
          <ul className="flex flex-col rounded-3xl bg-surface px-4 py-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 border-t border-dashed border-border py-3 text-sm first:border-t-0"
              >
                <span className="min-w-0 break-words">{item.text}</span>
                <div className="flex shrink-0 items-center">
                  <button type="button" aria-label="Edit" className={iconButton} onClick={() => setDialog({ item })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Hapus" className={iconButton} onClick={() => handleDelete(item)}>
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
        title={dialog?.item ? 'Edit' : 'Tambah yang Dikorbankan'}
        label="Yang dikorbankan"
        placeholder="mis. Scroll TikTok"
        initial={{ text: dialog?.item?.text }}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={({ text }) =>
          dialog?.item
            ? updateMutation.mutate({ id: dialog.item.id, text })
            : createMutation.mutate({ text })
        }
      />
    </div>
  );
}

export default SacrificesTab;
