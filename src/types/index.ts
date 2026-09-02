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
