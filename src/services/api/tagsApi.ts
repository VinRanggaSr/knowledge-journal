import { apiRequest } from '@/services/api/client';
import type { Tag } from '@/types';

export function listTags(): Promise<Tag[]> {
  return apiRequest<Tag[]>({ action: 'listTags' });
}

export function createTag(payload: { name: string; color: string }): Promise<Tag> {
  return apiRequest<Tag>({ action: 'createTag', payload });
}

export function updateTag(payload: { id: string; name: string; color: string }): Promise<Tag> {
  return apiRequest<Tag>({ action: 'updateTag', payload });
}

export function deleteTag(payload: { id: string }): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({ action: 'deleteTag', payload });
}
