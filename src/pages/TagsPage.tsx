import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Tags as TagsIcon, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import EmptyState from '@/components/EmptyState';
import TagBadge from '@/components/TagBadge';
import TagColorPicker from '@/components/TagColorPicker';
import { listTags, createTag, updateTag, deleteTag } from '@/services/api/tagsApi';
import type { Tag, TagColor } from '@/types';

function TagFormSheet({
  tag,
  open,
  onOpenChange,
}: {
  tag?: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(tag?.name ?? '');
  const [color, setColor] = useState<TagColor>(tag?.color ?? 'orange');

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onOpenChange(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (tag) {
      updateMutation.mutate({ id: tag.id, name: name.trim(), color });
    } else {
      createMutation.mutate({ name: name.trim(), color });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={tag ? 'Edit Tag' : 'Tambah Tag'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nama Tag</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Stock, Technology, Life"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Warna</label>
            <TagColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Preview</label>
            <TagBadge
              tag={{ id: 'preview', name: name || 'Nama Tag', color, createdAt: '' }}
              className="self-start"
            />
          </div>
          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function TagsPage() {
  const queryClient = useQueryClient();
  const { data: tags = [], isLoading } = useQuery({ queryKey: ['tags'], queryFn: listTags });

  const [addOpen, setAddOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  function handleDelete(tag: Tag) {
    const confirmed = window.confirm(
      `Hapus tag "${tag.name}"? Tag ini akan dilepas dari semua knowledge item yang memakainya.`,
    );
    if (confirmed) {
      deleteMutation.mutate({ id: tag.id });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola tag untuk mengelompokkan knowledge.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Tag
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && tags.length === 0 && (
        <EmptyState
          icon={TagsIcon}
          title="Belum ada tag"
          description="Tambah tag pertama untuk mulai mengelompokkan knowledge."
          action={{ label: 'Tambah Tag', onClick: () => setAddOpen(true) }}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {tags.map((tag) => (
          <Card
            key={tag.id}
            className="flex items-center justify-between border-dashed bg-transparent px-4 py-3"
          >
            <Link to={`/tags/${tag.id}`} className="flex flex-1 items-center">
              <TagBadge tag={tag} className="bg-surface" />
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Edit tag"
                onClick={() => setEditingTag(tag)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-background"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Hapus tag"
                onClick={() => handleDelete(tag)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-background"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <TagFormSheet open={addOpen} onOpenChange={setAddOpen} />
      {editingTag && (
        <TagFormSheet
          tag={editingTag}
          open={!!editingTag}
          onOpenChange={(open) => !open && setEditingTag(null)}
        />
      )}
    </div>
  );
}

export default TagsPage;
