import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EditorContent } from '@tiptap/react';
import { format } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRichTextEditor, RichTextToolbar } from '@/components/RichTextEditor';
import TagPicker from '@/components/TagPicker';
import { listTags } from '@/services/api/tagsApi';
import {
  listKnowledge,
  createKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
} from '@/services/api/knowledgeApi';
import type { KnowledgeItem } from '@/types';

function KnowledgeEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const today = format(new Date(), 'yyyy-MM-dd');
  const stateItem = (location.state as { item?: KnowledgeItem } | null)?.item;

  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });
  const { data: allItems = [] } = useQuery({
    queryKey: ['knowledge', {}],
    queryFn: () => listKnowledge({}),
    enabled: isEditing && !stateItem,
  });

  const existingItem = stateItem ?? allItems.find((item) => item.id === id);

  const [date, setDate] = useState(searchParams.get('date') ?? today);
  const [title, setTitle] = useState('');
  const [descHtml, setDescHtml] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (existingItem) {
      setDate(existingItem.date);
      setTitle(existingItem.title);
      setDescHtml(existingItem.descHtml);
      setTagIds(existingItem.tagIds);
    }
  }, [existingItem]);

  const createMutation = useMutation({
    mutationFn: createKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigate(-1);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigate(-1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigate(-1);
    },
  });

  function handleSave() {
    if (!title.trim()) return;
    if (isEditing && id) {
      updateMutation.mutate({ id, date, title: title.trim(), descHtml, tagIds });
    } else {
      createMutation.mutate({ date, title: title.trim(), descHtml, tagIds });
    }
  }

  function handleDelete() {
    if (!id) return;
    if (window.confirm(`Hapus knowledge "${title}"?`)) {
      deleteMutation.mutate({ id });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const editor = useRichTextEditor({
    value: descHtml,
    onChange: setDescHtml,
    placeholder: 'Tulis detail knowledge di sini...',
    contentClassName: 'min-h-[50vh] rounded-[30px] px-6 py-4',
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="rounded-full p-2 text-muted-foreground hover:bg-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Hapus"
              disabled={deleteMutation.isPending}
              className="rounded-full p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul knowledge"
        autoFocus
        className="w-full border-none bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 md:text-4xl"
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <TagPicker allTags={allTags} selectedIds={tagIds} onChange={setTagIds} />
      </div>

      {editor && (
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <RichTextToolbar editor={editor} layout="row" className="md:hidden" />
          <EditorContent editor={editor} className="md:flex-1" />
          <RichTextToolbar editor={editor} layout="panel" className="hidden md:flex md:w-60 md:shrink-0" />
        </div>
      )}
    </div>
  );
}

export default KnowledgeEditorPage;
