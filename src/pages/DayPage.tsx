import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import KnowledgeItemFormSheet from '@/components/KnowledgeItemFormSheet';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import { listTags } from '@/services/api/tagsApi';
import { formatDateLabel } from '@/lib/dateHelpers';
import type { KnowledgeItem } from '@/types';

function DayPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeDate = date ?? today;

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { date: activeDate }],
    queryFn: () => listKnowledge({ date: activeDate }),
  });
  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });

  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });

  function handleDelete(item: KnowledgeItem) {
    if (window.confirm(`Hapus knowledge "${item.title}"?`)) {
      deleteMutation.mutate({ id: item.id });
    }
  }

  function goToDate(offset: number) {
    const next = addDays(parseISO(activeDate), offset);
    navigate(`/days/${format(next, 'yyyy-MM-dd')}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            onClick={() => goToDate(-1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold capitalize">{formatDateLabel(activeDate)}</h1>
            <p className="text-sm text-muted-foreground">{items.length} knowledge item</p>
          </div>
          <button
            type="button"
            aria-label="Hari berikutnya"
            onClick={() => goToDate(1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && items.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada knowledge di hari ini</CardTitle>
            <CardDescription>Klik "Tambah" untuk mencatat knowledge pertama hari ini.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <KnowledgeItemCard
            key={item.id}
            item={item}
            tags={allTags}
            onEdit={() => setEditingItem(item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      <KnowledgeItemFormSheet open={addOpen} onOpenChange={setAddOpen} defaultDate={activeDate} />
      {editingItem && (
        <KnowledgeItemFormSheet
          item={editingItem}
          defaultDate={activeDate}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  );
}

export default DayPage;
