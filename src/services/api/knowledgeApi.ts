import { apiRequest } from '@/services/api/client';
import type { KnowledgeItem } from '@/types';

interface ListKnowledgeFilter {
  date?: string;
  weekKey?: string;
  monthKey?: string;
  tagId?: string;
}

export function listKnowledge(filter: ListKnowledgeFilter = {}): Promise<KnowledgeItem[]> {
  return apiRequest<KnowledgeItem[]>({ action: 'listKnowledge', payload: filter });
}

export function createKnowledgeItem(payload: {
  date: string;
  title: string;
  descHtml: string;
  tagIds: string[];
}): Promise<KnowledgeItem> {
  return apiRequest<KnowledgeItem>({ action: 'createKnowledgeItem', payload });
}

export function updateKnowledgeItem(payload: {
  id: string;
  date: string;
  title: string;
  descHtml: string;
  tagIds: string[];
}): Promise<KnowledgeItem> {
  return apiRequest<KnowledgeItem>({ action: 'updateKnowledgeItem', payload });
}

export function deleteKnowledgeItem(payload: { id: string }): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({ action: 'deleteKnowledgeItem', payload });
}
