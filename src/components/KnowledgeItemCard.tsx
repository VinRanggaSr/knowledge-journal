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
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{item.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
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
      </div>
      {item.descHtml && (
        <p className="text-sm text-muted-foreground">{stripHtml(item.descHtml)}</p>
      )}
      {itemTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {itemTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default KnowledgeItemCard;
