import { apiRequest } from '@/services/api/client';
import type { WeeklySummary, MonthlySummary } from '@/types';

export function getWeeklySummary(weekKey: string): Promise<WeeklySummary> {
  return apiRequest<WeeklySummary>({ action: 'getWeeklySummary', payload: { weekKey } });
}

export function saveWeeklySummary(payload: {
  weekKey: string;
  summaryHtml: string;
}): Promise<WeeklySummary> {
  return apiRequest<WeeklySummary>({ action: 'saveWeeklySummary', payload });
}

export function getMonthlySummary(monthKey: string): Promise<MonthlySummary> {
  return apiRequest<MonthlySummary>({ action: 'getMonthlySummary', payload: { monthKey } });
}

export function saveMonthlySummary(payload: {
  monthKey: string;
  summaryHtml: string;
}): Promise<MonthlySummary> {
  return apiRequest<MonthlySummary>({ action: 'saveMonthlySummary', payload });
}
