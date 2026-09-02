import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';
import TagPicker from '@/components/TagPicker';
import { listTags } from '@/services/api/tagsApi';
import { createKnowledgeItem, updateKnowledgeItem } from '@/services/api/knowledgeApi';
import type { KnowledgeItem } from '@/types';

interface KnowledgeItemFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  item?: KnowledgeItem;
}

function KnowledgeItemFormSheet({
  open,
  onOpenChange,
  defaultDate,
  item,
}: KnowledgeItemFormSheetProps) {
  const queryClient = useQueryClient();
  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });

  const [date, setDate] = useState(item?.date ?? defaultDate);
  const [title, setTitle] = useState(item?.title ?? '');
  const [descHtml, setDescHtml] = useState(item?.descHtml ?? '');
  const [tagIds, setTagIds] = useState<string[]>(item?.tagIds ?? []);

  const createMutation = useMutation({
    mutationFn: createKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      resetAndClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      resetAndClose();
    },
  });

  function resetAndClose() {
    setTitle('');
    setDescHtml('');
    setTagIds([]);
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (item) {
      updateMutation.mutate({ id: item.id, date, title: title.trim(), descHtml, tagIds });
    } else {
      createMutation.mutate({ date, title: title.trim(), descHtml, tagIds });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? 'Edit Knowledge' : 'Tambah Knowledge'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Tanggal</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Judul</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul knowledge"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Deskripsi</label>
            <RichTextEditor value={descHtml} onChange={setDescHtml} placeholder="Tulis detail knowledge di sini..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Tag</label>
            <TagPicker allTags={allTags} selectedIds={tagIds} onChange={setTagIds} />
          </div>
          <Button type="submit" disabled={isSaving || !title.trim()}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default KnowledgeItemFormSheet;
