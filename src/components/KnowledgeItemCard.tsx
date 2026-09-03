import { Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TagBadge from '@/components/TagBadge';
import ClampedText from '@/components/ClampedText';
import { stripHtml } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';
import type { KnowledgeItem, Tag } from '@/types';

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  tags: Tag[];
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

function KnowledgeItemCard({ item, tags, onEdit, onDelete, className }: KnowledgeItemCardProps) {
  const itemTags = tags.filter((t) => item.tagIds.includes(t.id));
  const showActions = onEdit || onDelete;

  return (
    <div className={cn('h-full rounded-[30px] border border-border bg-[#eeeeec] p-1.5', className)}>
      <Card className="flex h-full flex-col items-center gap-2 rounded-3xl border-0 p-4 text-center">
        {itemTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {itemTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
        <h3 className="line-clamp-2 font-semibold">{item.title}</h3>
        {item.descHtml && (
          <ClampedText text={stripHtml(item.descHtml, Infinity)} className="max-h-[4.5rem] w-full flex-1" />
        )}
        {showActions && (
          <div className="mt-auto flex items-center justify-center gap-2 pt-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-background"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-background"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default KnowledgeItemCard;
