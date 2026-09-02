import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { getWeeklySummary, saveWeeklySummary } from '@/services/api/summaryApi';
import { formatDateLabel } from '@/lib/dateHelpers';

function WeekPage() {
  const { weekKey = '' } = useParams();
  const queryClient = useQueryClient();

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

  const days = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.date, (map.get(item.date) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Minggu {weekKey}</h1>
        <p className="text-sm text-muted-foreground">{items.length} knowledge item</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && days.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada knowledge di minggu ini</CardTitle>
            <CardDescription>Catat knowledge harian dulu supaya hari muncul di sini.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {days.map(([date, count]) => (
          <Link key={date} to={`/days/${date}`}>
            <Card className="flex items-center justify-between p-4 hover:bg-background/50">
              <div>
                <p className="font-semibold capitalize">{formatDateLabel(date)}</p>
                <p className="text-sm text-muted-foreground">{count} knowledge item</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
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
    </div>
  );
}

export default WeekPage;
