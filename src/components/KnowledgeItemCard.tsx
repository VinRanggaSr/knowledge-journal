import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TagBadge from '@/components/TagBadge';
import { stripHtml } from '@/lib/dateHelpers';
import type { KnowledgeItem, Tag } from '@/types';

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  tags: Tag[];
  onEdit: () => void;
  onDelete: () => void;
}

function KnowledgeItemCard({ item, tags, onEdit, onDelete }: KnowledgeItemCardProps) {
  const itemTags = tags.filter((t) => item.tagIds.includes(t.id));

  return (
    <Card className="flex h-full flex-col gap-2 p-4">
      {itemTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {itemTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <h3 className="line-clamp-2 font-semibold">{item.title}</h3>
      {item.descHtml && (
        <div className="relative max-h-[4.5rem] flex-1 overflow-hidden">
          <p className="text-sm leading-6 text-muted-foreground">{stripHtml(item.descHtml, Infinity)}</p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-surface to-transparent" />
        </div>
      )}
      <div className="mt-1 flex items-center justify-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          aria-label="Edit"
          onClick={onEdit}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-background"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Hapus"
          onClick={onDelete}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-background"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}

export default KnowledgeItemCard;
