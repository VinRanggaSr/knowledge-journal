import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addWeeks, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import KnowledgeItemFormSheet from '@/components/KnowledgeItemFormSheet';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import { listTags } from '@/services/api/tagsApi';
import { getWeeklySummary, saveWeeklySummary } from '@/services/api/summaryApi';
import { getWeekDates, getWeekKey, formatWeekRangeLabel, formatDateLabel } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';
import type { KnowledgeItem } from '@/types';

function WeekPage() {
  const { weekKey = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDates = useMemo(() => getWeekDates(weekKey), [weekKey]);
  const weekDateStrs = useMemo(() => weekDates.map((d) => format(d, 'yyyy-MM-dd')), [weekDates]);

  const [selectedDate, setSelectedDate] = useState(
    () => weekDateStrs.find((d) => d === today) ?? weekDateStrs[0] ?? today,
  );

  useEffect(() => {
    setSelectedDate((prev) =>
      weekDateStrs.includes(prev) ? prev : weekDateStrs.find((d) => d === today) ?? weekDateStrs[0] ?? today,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { weekKey }],
    queryFn: () => listKnowledge({ weekKey }),
  });

  const { data: allTags = [] } = useQuery({ queryKey: ['tags'], queryFn: listTags });

  const { data: summary } = useQuery({
    queryKey: ['weeklySummary', weekKey],
    queryFn: () => getWeeklySummary(weekKey),
  });

  const [summaryHtml, setSummaryHtml] = useState('');

  useEffect(() => {
    setSummaryHtml(summary?.summaryHtml ?? '');
  }, [summary?.summaryHtml]);

  const saveMutation = useMutation({
    mutationFn: saveWeeklySummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySummary', weekKey] });
    },
  });

  const [addOpen, setAddOpen] = useState(false);
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

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => map.set(item.date, (map.get(item.date) ?? 0) + 1));
    return map;
  }, [items]);

  const dayItems = useMemo(
    () =>
      items
        .filter((item) => item.date === selectedDate)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [items, selectedDate],
  );

  function goToWeek(offset: number) {
    const base = weekDates[0] ?? new Date();
    navigate(`/weeks/${getWeekKey(addWeeks(base, offset))}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Minggu sebelumnya"
          onClick={() => goToWeek(-1)}
          className="rounded-full p-2 text-muted-foreground hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold">{formatWeekRangeLabel(weekDates)}</h1>
          <p className="text-sm text-muted-foreground">{items.length} knowledge item</p>
        </div>
        <button
          type="button"
          aria-label="Minggu berikutnya"
          onClick={() => goToWeek(1)}
          className="rounded-full p-2 text-muted-foreground hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Ringkasan Mingguan</h2>
        <RichTextEditor
          value={summaryHtml}
          onChange={setSummaryHtml}
          placeholder="Tulis ringkasan knowledge minggu ini..."
        />
        <Button
          onClick={() => saveMutation.mutate({ weekKey, summaryHtml })}
          disabled={saveMutation.isPending}
          className="self-start"
        >
          {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Ringkasan'}
        </Button>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          const count = countByDate.get(dateStr) ?? 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                'flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-colors',
                isSelected
                  ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                  : 'border-border bg-surface text-muted-foreground hover:bg-background',
              )}
            >
              <span className="text-xs font-normal capitalize">
                {format(date, 'EEE', { locale: idLocale })}
              </span>
              <span className="text-2xl font-bold">{format(date, 'd')}</span>
              <span
                className={cn(
                  'mt-1 h-1.5 w-1.5 rounded-full',
                  count > 0 ? 'bg-current' : 'bg-transparent',
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold capitalize">{formatDateLabel(selectedDate)}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && dayItems.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada knowledge di hari ini</CardTitle>
            <CardDescription>Klik "Tambah" untuk mencatat knowledge pertama hari ini.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dayItems.map((item) => (
          <KnowledgeItemCard
            key={item.id}
            item={item}
            tags={allTags}
            onEdit={() => setEditingItem(item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      <KnowledgeItemFormSheet open={addOpen} onOpenChange={setAddOpen} defaultDate={selectedDate} />
      {editingItem && (
        <KnowledgeItemFormSheet
          item={editingItem}
          defaultDate={selectedDate}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  );
}

export default WeekPage;
