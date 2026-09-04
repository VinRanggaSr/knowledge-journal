import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TagIcon } from 'lucide-react';
import TagBadge from '@/components/TagBadge';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import { listTags } from '@/services/api/tagsApi';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import type { KnowledgeItem } from '@/types';

function TagDetailPage() {
  const { tagId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });
  const tag = allTags.find((t) => t.id === tagId);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { tagId }],
    queryFn: () => listKnowledge({ tagId }),
    enabled: !!tagId,
  });

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
      <Breadcrumbs items={[{ label: 'Tags', to: '/tags' }, { label: tag?.name ?? 'Tag' }]} />

      <div className="flex items-center gap-3">
        {tag ? <TagBadge tag={tag} /> : <h1 className="text-2xl font-semibold">Tag</h1>}
        <p className="text-sm text-muted-foreground">{items.length} knowledge item</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={TagIcon}
          title="Belum ada knowledge dengan tag ini"
          description="Tambahkan tag ini ke knowledge item untuk melihatnya di sini."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <KnowledgeItemCard
            key={item.id}
            item={item}
            tags={allTags}
            onEdit={() => navigate(`/knowledge/${item.id}/edit`, { state: { item } })}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default TagDetailPage;
