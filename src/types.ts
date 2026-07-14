export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ThesisTask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface ProgressEntry {
  id: string;
  date: string; // ISO date (yyyy-mm-dd), the date the work happened — user-editable
  note: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  plannedStart: string; // ISO date
  plannedEnd: string; // ISO date
  completedAt: string | null; // ISO date, set when milestone marked done
  tasks: ThesisTask[];
  log: ProgressEntry[];
}

export interface ThesisMeta {
  title: string;
  studentName: string;
  advisor: string;
  institution: string;
  startDate: string; // ISO date
  targetDate: string; // ISO date
}

export type HistoryEventType =
  | 'milestone-added'
  | 'milestone-edited'
  | 'milestone-deleted'
  | 'milestone-completed'
  | 'milestone-reopened'
  | 'task-added'
  | 'task-edited'
  | 'task-deleted'
  | 'task-completed'
  | 'task-reopened'
  | 'progress-logged'
  | 'progress-edited'
  | 'progress-deleted'
  | 'plan-details-edited';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  at: string; // ISO datetime
  summary: string;
}

export interface ThesisPlan {
  formatVersion: 2;
  meta: ThesisMeta;
  milestones: Milestone[];
  history: HistoryEvent[];
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type ViewId = 'overview' | 'plan' | 'progress' | 'gantt' | 'history';
