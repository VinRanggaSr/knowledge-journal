import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CalendarRange } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import RichTextEditor from '@/components/RichTextEditor';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { getMonthlySummary, saveMonthlySummary } from '@/services/api/summaryApi';
import { formatMonthLabel, getWeekKey } from '@/lib/dateHelpers';

function MonthPage() {
  const { monthKey = '' } = useParams();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { monthKey }],
    queryFn: () => listKnowledge({ monthKey }),
  });

  const { data: summary } = useQuery({
    queryKey: ['monthlySummary', monthKey],
    queryFn: () => getMonthlySummary(monthKey),
  });

  const [summaryHtml, setSummaryHtml] = useState('');

  useEffect(() => {
    setSummaryHtml(summary?.summaryHtml ?? '');
  }, [summary?.summaryHtml]);

  const saveMutation = useMutation({
    mutationFn: saveMonthlySummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', monthKey] });
    },
  });

  const weeks = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const weekKey = getWeekKey(item.date);
      map.set(weekKey, (map.get(weekKey) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold capitalize">{formatMonthLabel(monthKey)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} knowledge item</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && weeks.length === 0 && (
        <EmptyState
          icon={CalendarRange}
          title="Belum ada knowledge di bulan ini"
          description="Catat knowledge harian dulu supaya minggu muncul di sini."
        />
      )}

      <div className="flex flex-col gap-3">
        {weeks.map(([weekKey, count]) => (
          <Link key={weekKey} to={`/weeks/${weekKey}`}>
            <Card className="flex items-center justify-between p-4 hover:bg-background/50">
              <div>
                <p className="font-semibold">Minggu {weekKey}</p>
                <p className="text-sm text-muted-foreground">{count} knowledge item</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Ringkasan Bulanan</h2>
        <RichTextEditor
          value={summaryHtml}
          onChange={setSummaryHtml}
          placeholder="Tulis ringkasan knowledge bulan ini..."
        />
        <Button
          onClick={() => saveMutation.mutate({ monthKey, summaryHtml })}
          disabled={saveMutation.isPending}
          className="self-start"
        >
          {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Ringkasan'}
        </Button>
      </Card>
    </div>
  );
}

export default MonthPage;
