import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, FileText, Pencil, Plus } from 'lucide-react';
import { addWeeks, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import ClampedText from '@/components/ClampedText';
import KnowledgeItemCard from '@/components/KnowledgeItemCard';
import { listKnowledge, deleteKnowledgeItem } from '@/services/api/knowledgeApi';
import { listTags } from '@/services/api/tagsApi';
import { getWeeklySummary } from '@/services/api/summaryApi';
import { getWeekDates, getWeekKey, formatWeekRangeLabel, formatDateLabel, stripHtml } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';
import type { KnowledgeItem } from '@/types';

function WeeklySummaryCard({ weekKey }: { weekKey: string }) {
  const navigate = useNavigate();
  const { data: summary } = useQuery({
    queryKey: ['weeklySummary', weekKey],
    queryFn: () => getWeeklySummary(weekKey),
  });

  const summaryText = summary?.summaryHtml ? stripHtml(summary.summaryHtml, Infinity) : '';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">Ringkasan Mingguan</h2>
        {summaryText && (
          <Link
            to={`/weeks/${weekKey}/summary`}
            aria-label="Edit ringkasan"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-background"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {summaryText ? (
        <ClampedText text={summaryText} className="max-h-48" gradientFrom="background" />
      ) : (
        <EmptyState
          icon={FileText}
          title="Belum ada ringkasan mingguan"
          description="Tulis ringkasan knowledge minggu ini."
          action={{ label: 'Tambah Ringkasan', onClick: () => navigate(`/weeks/${weekKey}/summary`) }}
          className="py-6"
          compact
        />
      )}
    </div>
  );
}

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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{formatWeekRangeLabel(weekDates)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} knowledge item</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Minggu sebelumnya"
            onClick={() => goToWeek(-1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Minggu berikutnya"
            onClick={() => goToWeek(1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {items.length > 0 && <WeeklySummaryCard weekKey={weekKey} />}

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Tanggal di Minggu ini</h2>
        <div className="flex items-start justify-between gap-1">
          {weekDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;
            const count = countByDate.get(dateStr) ?? 0;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className="flex flex-1 flex-col items-center gap-1.5 py-1"
              >
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {format(date, 'EEE', { locale: idLocale })}
                </span>
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-foreground transition-colors',
                    isSelected ? 'border border-border bg-surface' : 'hover:bg-background',
                  )}
                >
                  {format(date, 'd')}
                </span>
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', count > 0 ? 'bg-muted-foreground' : 'bg-transparent')}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold capitalize">{formatDateLabel(selectedDate)}</h2>
        <Button size="sm" onClick={() => navigate(`/knowledge/new?date=${selectedDate}`)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && dayItems.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Belum ada knowledge di hari ini"
          description="Klik &quot;Tambah&quot; untuk mencatat knowledge pertama hari ini."
          action={{ label: 'Tambah Knowledge', onClick: () => navigate(`/knowledge/new?date=${selectedDate}`) }}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dayItems.map((item) => (
          <KnowledgeItemCard
            key={item.id}
            item={item}
            tags={allTags}
            onEdit={() => navigate(`/knowledge/${item.id}/edit`, { state: { item } })}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default WeekPage;
