export type TagColor =
  | 'orange'
  | 'violet'
  | 'teal'
  | 'blue'
  | 'pink'
  | 'green'
  | 'yellow';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  descHtml: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  weekKey: string; // YYYY-Www
  summaryHtml: string;
  updatedAt: string;
}

export interface MonthlySummary {
  monthKey: string; // YYYY-MM
  summaryHtml: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  createdAt: string;
}

export interface GoalItem {
  id: string;
  goalId: string;
  text: string;
  createdAt: string;
}

export interface GoalsData {
  goals: Goal[];
  items: GoalItem[];
}

export interface Action {
  id: string;
  title: string;
  isDaily: boolean;
  createdAt: string;
}

export interface ActionLog {
  date: string; // YYYY-MM-DD
  actionId: string;
}

export interface Sacrifice {
  id: string;
  text: string;
  createdAt: string;
}
