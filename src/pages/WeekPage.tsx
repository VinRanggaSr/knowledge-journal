import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addWeeks, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { getWeeklySummary, saveWeeklySummary } from '@/services/api/summaryApi';
import { getWeekDates, getWeekKey, formatWeekRangeLabel } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';

function WeekPage() {
  const { weekKey = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDates = useMemo(() => getWeekDates(weekKey), [weekKey]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { weekKey }],
    queryFn: () => listKnowledge({ weekKey }),
  });

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

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => map.set(item.date, (map.get(item.date) ?? 0) + 1));
    return map;
  }, [items]);

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

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isToday = dateStr === today;
          const count = countByDate.get(dateStr) ?? 0;

          return (
            <Link
              key={dateStr}
              to={`/days/${dateStr}`}
              className={cn(
                'flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-colors',
                isToday
                  ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                  : 'border-border bg-surface text-muted-foreground hover:bg-background',
              )}
            >
              <span className="text-xs">{format(date, 'd')}</span>
              <span className="text-sm font-medium capitalize">
                {format(date, 'EEE', { locale: idLocale })}
              </span>
              <span
                className={cn(
                  'mt-1 h-1.5 w-1.5 rounded-full',
                  count > 0 ? 'bg-current' : 'bg-transparent',
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default WeekPage;
