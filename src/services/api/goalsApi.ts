import { apiRequest } from '@/services/api/client';
import type { Action, ActionLog, Goal, GoalItem, GoalsData } from '@/types';

export function listGoals(): Promise<GoalsData> {
  return apiRequest<GoalsData>({ action: 'listGoals' });
}

export function createGoal(payload: { title: string }): Promise<Goal> {
  return apiRequest<Goal>({ action: 'createGoal', payload });
}

export function updateGoal(payload: { id: string; title: string }): Promise<Goal> {
  return apiRequest<Goal>({ action: 'updateGoal', payload });
}

export function deleteGoal(payload: { id: string }): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({ action: 'deleteGoal', payload });
}

export function createGoalItem(payload: { goalId: string; text: string }): Promise<GoalItem> {
  return apiRequest<GoalItem>({ action: 'createGoalItem', payload });
}

export function updateGoalItem(payload: { id: string; text: string }): Promise<GoalItem> {
  return apiRequest<GoalItem>({ action: 'updateGoalItem', payload });
}

export function deleteGoalItem(payload: { id: string }): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({ action: 'deleteGoalItem', payload });
}

export function listActions(): Promise<Action[]> {
  return apiRequest<Action[]>({ action: 'listActions' });
}

export function createAction(payload: { title: string; isDaily: boolean }): Promise<Action> {
  return apiRequest<Action>({ action: 'createAction', payload });
}

export function updateAction(payload: { id: string; title: string; isDaily: boolean }): Promise<Action> {
  return apiRequest<Action>({ action: 'updateAction', payload });
}

export function deleteAction(payload: { id: string }): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({ action: 'deleteAction', payload });
}

export function listActionLogs(): Promise<ActionLog[]> {
  return apiRequest<ActionLog[]>({ action: 'listActionLogs' });
}

export function setActionLog(payload: { date: string; actionId: string; done: boolean }) {
  return apiRequest<{ date: string; actionId: string; done: boolean }>({ action: 'setActionLog', payload });
}
