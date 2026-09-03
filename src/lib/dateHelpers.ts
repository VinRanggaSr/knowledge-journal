import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  setISOWeek,
  addDays,
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

/** Senin-Minggu dari sebuah weekKey ("2026-W36") */
export function getWeekDates(weekKey: string): Date[] {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = Number(yearStr);
  const week = Number(weekStr);
  if (!year || !week) return [];
  const base = setISOWeek(new Date(year, 0, 4), week);
  const start = startOfISOWeek(base);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatWeekRangeLabel(dates: Date[]): string {
  if (dates.length === 0) return '';
  const start = dates[0];
  const end = dates[dates.length - 1];
  const sameMonth = format(start, 'MM-yyyy') === format(end, 'MM-yyyy');
  if (sameMonth) {
    return `${format(start, 'd')} - ${format(end, 'd MMMM yyyy', { locale: idLocale })}`;
  }
  return `${format(start, 'd MMM', { locale: idLocale })} - ${format(end, 'd MMM yyyy', { locale: idLocale })}`;
}

export function formatDateLabel(date: string): string {
  return format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: idLocale });
}

export function formatMonthLabel(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: idLocale });
}

export function stripHtml(html: string, maxLength = 140): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
