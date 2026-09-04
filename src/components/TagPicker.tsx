import { useState } from 'react';
import { Tag as TagIcon, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TagBadge from '@/components/TagBadge';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

interface TagPickerProps {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function TagPicker({ allTags, selectedIds, onChange }: TagPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = allTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedTags = allTags.filter((t) => selectedIds.includes(t.id));

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-surface p-1.5">
            {selectedTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} className="bg-[#eeeeec]" />
            ))}
          </div>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              <TagIcon className="h-3.5 w-3.5" />
              Pilih Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tag..."
              className="mb-2"
            />
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-2 py-1 text-sm text-muted-foreground">Tidak ada tag ditemukan.</p>
              )}
              {filtered.map((tag) => {
                const isSelected = selectedIds.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggle(tag.id)}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-background',
                      isSelected && 'bg-background',
                    )}
                  >
                    <TagBadge tag={tag} />
                    {isSelected && <Check className="h-4 w-4 text-foreground" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default TagPicker;
