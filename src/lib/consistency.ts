import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfISOWeek,
  startOfMonth,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Action, ActionLog } from '@/types';

export type Granularity = 'daily' | 'weekly' | 'monthly';
export type Trend = 'up' | 'steady' | 'down';

export interface ConsistencyPoint {
  label: string;
  percent: number | null;
  done: number;
  expected: number;
}

const TREND_THRESHOLD = 5;

function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Daily actions that already existed on the given date. */
export function dailyActionsOn(actions: Action[], date: string): Action[] {
  return actions.filter((a) => a.isDaily && a.createdAt.slice(0, 10) <= date);
}

function tally(days: Date[], actions: Action[], doneKeys: Set<string>, today: string) {
  let done = 0;
  let expected = 0;
  days.forEach((day) => {
    const dateStr = toDateStr(day);
    if (dateStr > today) return;
    const daily = dailyActionsOn(actions, dateStr);
    expected += daily.length;
    daily.forEach((a) => {
      if (doneKeys.has(`${dateStr}|${a.id}`)) done += 1;
    });
  });
  return { done, expected };
}

export function buildSeries(
  granularity: Granularity,
  actions: Action[],
  logs: ActionLog[],
  today: string,
): ConsistencyPoint[] {
  const doneKeys = new Set(logs.map((l) => `${l.date}|${l.actionId}`));
  const todayDate = parseISO(today);

  const periods: { label: string; days: Date[] }[] = [];

  if (granularity === 'daily') {
    for (let i = 13; i >= 0; i -= 1) {
      const d = subDays(todayDate, i);
      periods.push({ label: format(d, 'd MMM', { locale: idLocale }), days: [d] });
    }
  } else if (granularity === 'weekly') {
    for (let i = 7; i >= 0; i -= 1) {
      const start = startOfISOWeek(subWeeks(todayDate, i));
      periods.push({
        label: format(start, 'd MMM', { locale: idLocale }),
        days: eachDayOfInterval({ start, end: addDays(start, 6) }),
      });
    }
  } else {
    for (let i = 5; i >= 0; i -= 1) {
      const m = subMonths(todayDate, i);
      periods.push({
        label: format(m, 'MMM', { locale: idLocale }),
        days: eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) }),
      });
    }
  }

  return periods.map(({ label, days }) => {
    const { done, expected } = tally(days, actions, doneKeys, today);
    return { label, done, expected, percent: expected > 0 ? Math.round((done / expected) * 100) : null };
  });
}

export function summarize(series: ConsistencyPoint[]): { average: number | null; trend: Trend } {
  const values = series.map((p) => p.percent).filter((v): v is number => v !== null);
  if (values.length === 0) return { average: null, trend: 'steady' };

  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const average = Math.round(avg(values));
  if (values.length < 2) return { average, trend: 'steady' };

  const mid = Math.floor(values.length / 2);
  const diff = avg(values.slice(mid)) - avg(values.slice(0, mid));
  const trend: Trend = diff > TREND_THRESHOLD ? 'up' : diff < -TREND_THRESHOLD ? 'down' : 'steady';
  return { average, trend };
}
