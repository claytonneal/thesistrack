import { useState } from 'react';
import type { TaskStatus, ThesisPlan } from '../types';
import { milestoneProgress, milestoneStatus, orderedMilestones, overallProgress } from '../lib/progress';
import { daysUntil, formatDate, isOverdue } from '../lib/date';
import { ProgressRing } from './ProgressRing';
import { ProgressBar } from './ProgressBar';
import { StatusStamp } from './StatusStamp';
import { ChevronDownIcon } from './Icons';

function taskStatusLabel(status: TaskStatus): string {
  if (status === 'done') return 'Done';
  if (status === 'in-progress') return 'In progress';
  return 'To do';
}

export function Overview({ plan }: { plan: ThesisPlan }) {
  const milestones = orderedMilestones(plan);
  const total = milestones.length;
  const done = milestones.filter((m) => milestoneStatus(m) === 'done').length;
  const overdue = milestones.filter((m) => isOverdue(m.plannedEnd, milestoneStatus(m) === 'done')).length;
  const remaining = plan.meta.targetDate ? daysUntil(plan.meta.targetDate) : null;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const metaParts = [
    plan.meta.studentName,
    plan.meta.advisor && `Advised by ${plan.meta.advisor}`,
    plan.meta.institution,
  ].filter(Boolean);

  return (
    <div>
      <section className="card overview-hero">
        <div>
          <h1 className="overview-hero-title">{plan.meta.title || 'Untitled thesis'}</h1>
          <div className="overview-meta-line">
            {metaParts.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </div>
          <div className="overview-meta-line" style={{ marginTop: '0.5rem' }}>
            <span>Started {formatDate(plan.meta.startDate)}</span>
            {plan.meta.targetDate && <span>Target {formatDate(plan.meta.targetDate)}</span>}
          </div>
        </div>
        <ProgressRing percent={overallProgress(plan)} />
      </section>

      <div className="stat-row">
        <div className="stat-cell">
          <div className="label" style={{ marginBottom: '0.4rem' }}>
            Milestones
          </div>
          <div className="stat-cell-value">
            {done} / {total}
          </div>
        </div>
        <div className="stat-cell">
          <div className="label" style={{ marginBottom: '0.4rem' }}>
            Days remaining
          </div>
          <div className="stat-cell-value">{remaining === null ? '—' : remaining}</div>
        </div>
        <div className="stat-cell">
          <div className="label" style={{ marginBottom: '0.4rem' }}>
            Overdue
          </div>
          <div className={`stat-cell-value${overdue > 0 ? ' accent-rust' : ''}`}>{overdue}</div>
        </div>
      </div>

      <div className="section-heading">
        <h2>Milestone Progress</h2>
        <span className="label">{total} milestone{total === 1 ? '' : 's'}</span>
      </div>

      {total === 0 ? (
        <div className="card timeline-empty">
          No milestones yet. Head to the Plan tab to lay out your thesis timeline.
        </div>
      ) : (
        <div className="timeline">
          {milestones.map((m, i) => {
            const pct = milestoneProgress(m);
            const isDone = milestoneStatus(m) === 'done';
            const overdueRow = isOverdue(m.plannedEnd, isDone);
            const isOpen = expanded.has(m.id);
            return (
              <div className="card timeline-item" key={m.id}>
                <div
                  className="timeline-row"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => toggleExpanded(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(m.id);
                    }
                  }}
                >
                  <span className="timeline-index mono">{String(i + 1).padStart(2, '0')}</span>
                  <div className="timeline-body">
                    <div className="timeline-title-row">
                      <span className="timeline-title">{m.title || 'Untitled milestone'}</span>
                      <StatusStamp milestone={m} />
                    </div>
                    <div className="timeline-dates">
                      {formatDate(m.plannedStart, { withYear: false })} – {formatDate(m.plannedEnd, { withYear: false })}
                    </div>
                    <div className="timeline-progress">
                      <ProgressBar percent={pct} />
                      <span className="timeline-progress-value">{pct}%</span>
                    </div>
                  </div>
                  <div className="timeline-side">
                    <span>
                      {isDone
                        ? m.completedAt
                          ? `Completed ${formatDate(m.completedAt, { withYear: false })}`
                          : 'Done'
                        : overdueRow
                          ? `${Math.abs(daysUntil(m.plannedEnd))}d overdue`
                          : `${daysUntil(m.plannedEnd)}d left`}
                    </span>
                    <ChevronDownIcon className={`timeline-chevron${isOpen ? ' is-open' : ''}`} />
                  </div>
                </div>
                {isOpen && (
                  <div className="timeline-tasks">
                    {m.tasks.length === 0 ? (
                      <p className="timeline-tasks-empty">No tasks added for this milestone.</p>
                    ) : (
                      <ul className="timeline-task-list">
                        {m.tasks.map((task) => (
                          <li className={`timeline-task-row status-${task.status}`} key={task.id}>
                            <span className={`task-status-dot status-${task.status}`} />
                            <span className="timeline-task-title">{task.title || 'Untitled task'}</span>
                            <span className="timeline-task-status mono">{taskStatusLabel(task.status)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
