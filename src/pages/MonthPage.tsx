import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarRange, FileText, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import ClampedText from '@/components/ClampedText';
import { listKnowledge } from '@/services/api/knowledgeApi';
import { getMonthlySummary, getWeeklySummary } from '@/services/api/summaryApi';
import { formatMonthLabel, getWeekKey, stripHtml } from '@/lib/dateHelpers';

interface WeekCardProps {
  weekKey: string;
  count: number;
}

function WeekCard({ weekKey, count }: WeekCardProps) {
  const { data: summary } = useQuery({
    queryKey: ['weeklySummary', weekKey],
    queryFn: () => getWeeklySummary(weekKey),
  });

  const summaryText = summary?.summaryHtml ? stripHtml(summary.summaryHtml, Infinity) : '';

  return (
    <Card className="flex flex-col gap-4 p-4">
      <Link to={`/weeks/${weekKey}`} className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Minggu {weekKey}</p>
          <p className="text-sm text-muted-foreground">{count} knowledge item</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="border-t border-dashed border-border" />

      {summaryText ? (
        <ClampedText text={summaryText} className="max-h-24" />
      ) : (
        <EmptyState
          icon={FileText}
          title="Belum ada ringkasan mingguan"
          description="Tulis ringkasan minggu ini di halaman detail minggu."
          className="py-6"
          compact
        />
      )}
    </Card>
  );
}

function MonthlySummaryCard({ monthKey }: { monthKey: string }) {
  const navigate = useNavigate();
  const { data: summary } = useQuery({
    queryKey: ['monthlySummary', monthKey],
    queryFn: () => getMonthlySummary(monthKey),
  });

  const summaryText = summary?.summaryHtml ? stripHtml(summary.summaryHtml, Infinity) : '';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">Ringkasan Bulanan</h2>
        {summaryText && (
          <Link
            to={`/months/${monthKey}/summary`}
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
          title="Belum ada ringkasan bulanan"
          description="Tulis ringkasan knowledge bulan ini."
          action={{ label: 'Tambah Ringkasan', onClick: () => navigate(`/months/${monthKey}/summary`) }}
          className="py-6"
          compact
        />
      )}
    </div>
  );
}

function MonthPage() {
  const { monthKey = '' } = useParams();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge', { monthKey }],
    queryFn: () => listKnowledge({ monthKey }),
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
      <Breadcrumbs items={[{ label: 'Timeline', to: '/' }, { label: formatMonthLabel(monthKey) }]} />

      <div>
        <h1 className="text-2xl font-semibold capitalize">{formatMonthLabel(monthKey)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} knowledge item</p>
      </div>

      {items.length > 0 && <MonthlySummaryCard monthKey={monthKey} />}

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
          <WeekCard key={weekKey} weekKey={weekKey} count={count} />
        ))}
      </div>
    </div>
  );
}

export default MonthPage;
