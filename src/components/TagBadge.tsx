import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types';

interface TagBadgeProps {
  tag: Tag;
}

function TagBadge({ tag }: TagBadgeProps) {
  return <Badge color={tag.color}>{tag.name}</Badge>;
}

export default TagBadge;
