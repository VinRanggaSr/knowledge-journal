import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowRight, BookOpen, MousePointer2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/EmptyState';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { formatMonthLabel, getWeekKey } from '@/lib/dateHelpers';

function TimelinePage() {
  const navigate = useNavigate();
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
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan knowledge journal kamu.</p>
      </div>

      <Link to={`/weeks/${getWeekKey(today)}`}>
        <Card className="relative flex items-center justify-between gap-4 overflow-hidden border-dashed p-5">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface via-surface to-transparent" />

          <div className="relative flex flex-col items-start gap-3">
            <div>
              <p className="font-semibold">Catat knowledge hari ini</p>
              <p className="text-sm text-muted-foreground">
                Simpan hal baru yang kamu pelajari hari ini · {todayCount} tercatat
              </p>
            </div>
            <span className="inline-flex items-center rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-background">
              Buka Hari Ini
            </span>
          </div>

          <div className="relative hidden h-20 w-24 shrink-0 sm:block">
            <div className="absolute inset-0 flex flex-col gap-1.5 rounded-xl border border-border bg-background p-2.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-orange" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              </div>
              <div className="mt-1 h-1.5 w-3/4 rounded-full bg-border" />
              <div className="h-1.5 w-1/2 rounded-full bg-border" />
              <div className="h-1.5 w-2/3 rounded-full bg-border" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-orange text-white">
              <MousePointer2 className="h-3.5 w-3.5" />
            </div>
          </div>
        </Card>
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}

      {!isLoading && months.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Belum ada knowledge"
          description="Mulai catat knowledge harian kamu untuk melihat ringkasannya di sini."
          action={{ label: 'Tambah Knowledge', onClick: () => navigate('/knowledge/new') }}
        />
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
