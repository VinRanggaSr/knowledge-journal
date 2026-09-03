import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types';

interface TagBadgeProps {
  tag: Tag;
  className?: string;
}

function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <Badge color={tag.color} className={className}>
      {tag.name}
    </Badge>
  );
}

export default TagBadge;
