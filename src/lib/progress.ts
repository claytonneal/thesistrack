import type { Milestone, ThesisPlan } from '../types';

export type MilestoneStatus = 'todo' | 'in-progress' | 'done';

export function milestoneProgress(milestone: Milestone): number {
  if (milestone.completedAt) return 100;
  if (milestone.tasks.length === 0) return 0;
  const done = milestone.tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / milestone.tasks.length) * 100);
}

export function milestoneStatus(milestone: Milestone): MilestoneStatus {
  const pct = milestoneProgress(milestone);
  if (pct >= 100) return 'done';
  return pct > 0 ? 'in-progress' : 'todo';
}

export function overallProgress(plan: ThesisPlan): number {
  if (plan.milestones.length === 0) return 0;
  const total = plan.milestones.reduce((sum, m) => sum + milestoneProgress(m), 0);
  return Math.round(total / plan.milestones.length);
}

export function orderedMilestones(plan: ThesisPlan): Milestone[] {
  return [...plan.milestones].sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));
}
