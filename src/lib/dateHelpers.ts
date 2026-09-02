import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  format,
  parseISO,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/** Format: "2026-W07" — ISO week (Senin-Minggu) */
export function getWeekKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const week = getISOWeek(d);
  const year = getISOWeekYear(d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Format: "2026-02" */
export function getMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

export function getWeekRange(date: Date | string): { start: Date; end: Date } {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return { start: startOfISOWeek(d), end: endOfISOWeek(d) };
}

export function formatDateLabel(date: string): string {
  return format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: idLocale });
}

export function formatMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: idLocale });
}
