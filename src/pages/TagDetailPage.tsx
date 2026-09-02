import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TagBadge from '@/components/TagBadge';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import KnowledgeItemFormSheet from '@/components/KnowledgeItemFormSheet';
import { listTags } from '@/services/api/tagsApi';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import { format } from 'date-fns';
import type { KnowledgeItem } from '@/types';

function TagDetailPage() {
  const { tagId = '' } = useParams();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });
  const tag = allTags.find((t) => t.id === tagId);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { tagId }],
    queryFn: () => listKnowledge({ tagId }),
    enabled: !!tagId,
  });

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

  return (
    <div className="flex flex-col gap-4">
      <Link to="/tags" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Tags
      </Link>

      <div className="flex items-center gap-3">
        {tag ? <TagBadge tag={tag} /> : <h1 className="text-2xl font-semibold">Tag</h1>}
        <p className="text-sm text-muted-foreground">{items.length} knowledge item</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && items.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada knowledge dengan tag ini</CardTitle>
            <CardDescription>Tambahkan tag ini ke knowledge item untuk melihatnya di sini.</CardDescription>
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

      {editingItem && (
        <KnowledgeItemFormSheet
          item={editingItem}
          defaultDate={today}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  );
}

export default TagDetailPage;
