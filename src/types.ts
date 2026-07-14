export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ThesisTask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface ProgressEntry {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
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

export interface ThesisPlan {
  formatVersion: 1;
  meta: ThesisMeta;
  milestones: Milestone[];
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type ViewId = 'overview' | 'plan' | 'progress' | 'gantt';
