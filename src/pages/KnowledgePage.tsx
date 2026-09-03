import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import KnowledgeItemFormSheet from '@/components/KnowledgeItemFormSheet';
import { listTags } from '@/services/api/tagsApi';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import { stripHtml } from '@/lib/dateHelpers';
import { format } from 'date-fns';
import type { KnowledgeItem } from '@/types';

const ALL_TAB = 'all';

function KnowledgePage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', {}],
    queryFn: () => listKnowledge({}),
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
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

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTab = activeTab === ALL_TAB || item.tagIds.includes(activeTab);
      if (!matchesTab) return false;
      if (!query) return true;
      const haystack = `${item.title} ${stripHtml(item.descHtml, Infinity)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search, activeTab]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Knowledge</h1>
        <p className="text-sm text-muted-foreground">Cari dan jelajahi semua knowledge item kamu.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan judul atau deskripsi..."
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab(ALL_TAB)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors',
            activeTab === ALL_TAB
              ? 'bg-foreground text-white'
              : 'bg-surface text-muted-foreground hover:bg-background',
          )}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => setActiveTab(tag.id)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors',
              activeTab === tag.id
                ? 'bg-foreground text-white'
                : 'bg-surface text-muted-foreground hover:bg-background',
            )}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && filteredItems.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Tidak ada knowledge ditemukan"
          description={
            search.trim()
              ? 'Coba ubah kata kunci pencarian atau pilih tag lain.'
              : 'Belum ada knowledge dengan tag ini.'
          }
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <KnowledgeItemCard
            key={item.id}
            item={item}
            tags={tags}
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

export default KnowledgePage;
