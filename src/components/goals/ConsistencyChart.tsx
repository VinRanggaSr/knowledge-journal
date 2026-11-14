import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildSeries, summarize, type Granularity, type Trend } from '@/lib/consistency';
import type { Action, ActionLog } from '@/types';

const OPTIONS: { value: Granularity; label: string; hint: string }[] = [
  { value: 'daily', label: 'Harian', hint: '14 hari terakhir' },
  { value: 'weekly', label: 'Mingguan', hint: '8 minggu terakhir' },
  { value: 'monthly', label: 'Bulanan', hint: '6 bulan terakhir' },
];

const TREND_META: Record<Trend, { label: string; icon: typeof ArrowRight; className: string }> = {
  up: { label: 'Makin konsisten', icon: ArrowUpRight, className: 'bg-green-50 text-green-700' },
  steady: { label: 'Konsisten', icon: ArrowRight, className: 'bg-background text-foreground' },
  down: { label: 'Menurun', icon: ArrowDownRight, className: 'bg-red-50 text-red-700' },
};

const H = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

interface ConsistencyChartProps {
  actions: Action[];
  logs: ActionLog[];
  today: string;
}

function ConsistencyChart({ actions, logs, today }: ConsistencyChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const series = useMemo(() => buildSeries(granularity, actions, logs, today), [granularity, actions, logs, today]);
  // periode terakhir masih berjalan, jadi tidak ikut menentukan rata-rata & tren
  const { average, trend } = useMemo(() => summarize(series.slice(0, -1)), [series]);
  const meta = TREND_META[trend];
  const TrendIcon = meta.icon;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const y = (p: number) => PAD.top + plotH - (p / 100) * plotH;

  const segments: string[] = [];
  let current = '';
  series.forEach((p, i) => {
    if (p.percent === null) {
      if (current) segments.push(current);
      current = '';
      return;
    }
    current += `${current ? 'L' : 'M'}${x(i)},${y(p.percent)} `;
  });
  if (current) segments.push(current);

  const hasData = series.some((p) => p.percent !== null);
  const labelEvery = series.length > 8 ? 2 : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-background p-1">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setGranularity(o.value)}
              className={cn(
                'rounded-lg px-3 py-1 text-sm font-medium transition-colors',
                granularity === o.value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {hasData && average !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rata-rata {average}%</span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                meta.className,
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full">
      {hasData ? (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label="Grafik konsistensi action">
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--color-border)" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted-foreground)">
                {v}%
              </text>
            </g>
          ))}
          {segments.map((d) => (
            <path key={d} d={d} fill="none" stroke="var(--color-foreground)" strokeWidth="2" strokeLinejoin="round" />
          ))}
          {series.map((p, i) => (
            <g key={i}>
              {p.percent !== null && (
                <>
                  <circle cx={x(i)} cy={y(p.percent)} r="4" fill="var(--color-surface)" stroke="var(--color-foreground)" strokeWidth="2">
                    <title>{`${p.label}: ${p.percent}% (${p.done}/${p.expected})`}</title>
                  </circle>
                  {series.length <= 8 && (
                    <text x={x(i)} y={y(p.percent) - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-foreground)">
                      {p.percent}%
                    </text>
                  )}
                </>
              )}
              {i % labelEvery === 0 && (
                <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Belum ada data. Aktifkan switch &quot;setiap hari&quot; pada action, lalu mulai centang checklist.
        </p>
      )}
      </div>
      <p className="text-xs text-muted-foreground">
        {OPTIONS.find((o) => o.value === granularity)?.hint} · persentase = action tercentang dibagi action harian yang aktif.
      </p>
    </div>
  );
}

export default ConsistencyChart;
