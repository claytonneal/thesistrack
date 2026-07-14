import type { Milestone } from '../types';
import { milestoneStatus } from '../lib/progress';
import { isOverdue } from '../lib/date';

export function StatusStamp({ milestone }: { milestone: Milestone }) {
  const status = milestoneStatus(milestone);
  if (isOverdue(milestone.plannedEnd, status === 'done')) {
    return <span className="stamp stamp-overdue">Overdue</span>;
  }
  if (status === 'done') return <span className="stamp stamp-done">Done</span>;
  if (status === 'in-progress') return <span className="stamp stamp-in-progress">In progress</span>;
  return <span className="stamp stamp-todo">Not started</span>;
}
