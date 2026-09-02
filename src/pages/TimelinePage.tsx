import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { formatMonthLabel } from '@/lib/dateHelpers';

function TimelinePage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', {}],
    queryFn: () => listKnowledge({}),
  });

  const months = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const monthKey = item.date.slice(0, 7);
      map.set(monthKey, (map.get(monthKey) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([monthKey, count]) => ({ monthKey, count }));
  }, [items]);

  const todayCount = items.filter((i) => i.date === today).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <p className="text-sm text-muted-foreground">Ringkasan knowledge journal kamu.</p>
      </div>

      <Link to={`/days/${today}`}>
        <Card className="flex items-center justify-between p-5 hover:bg-background/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-orange/10 text-accent-orange">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Hari ini</p>
              <p className="text-sm text-muted-foreground">{todayCount} knowledge item</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Card>
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && months.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada knowledge</CardTitle>
            <CardDescription>
              Mulai catat knowledge harian kamu lewat tombol "Tambah Knowledge".
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {months.map(({ monthKey, count }) => (
          <Link key={monthKey} to={`/months/${monthKey}`}>
            <Card className="flex items-center justify-between p-4 hover:bg-background/50">
              <div>
                <p className="font-semibold capitalize">{formatMonthLabel(monthKey)}</p>
                <p className="text-sm text-muted-foreground">{count} knowledge item</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TimelinePage;
