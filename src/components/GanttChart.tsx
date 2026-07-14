import { Fragment } from 'react';
import type { ThesisPlan } from '../types';
import { milestoneProgress, milestoneStatus, orderedMilestones } from '../lib/progress';
import { formatDate, todayIso, toIsoDate } from '../lib/date';
import { computeGanttRange, isWithinRange, monthTicks, percentForIso } from '../lib/gantt';
import { StatusStamp } from './StatusStamp';

export function GanttChart({ plan }: { plan: ThesisPlan }) {
  const milestones = orderedMilestones(plan);

  if (milestones.length === 0) {
    return (
      <div className="card progress-empty">
        No milestones to chart yet. Add some in the Plan tab first.
      </div>
    );
  }

  const range = computeGanttRange(plan);
  const ticks = monthTicks(range);
  const today = todayIso();
  const todayPercent = isWithinRange(today, range) ? percentForIso(today, range) : null;
  const targetPercent =
    plan.meta.targetDate && isWithinRange(plan.meta.targetDate, range)
      ? percentForIso(plan.meta.targetDate, range)
      : null;

  return (
    <div>
      <div className="section-heading">
        <h2>Gantt</h2>
        <span className="label">
          {formatDate(toIsoDate(range.start))} – {formatDate(plan.meta.targetDate || toIsoDate(range.end))}
        </span>
      </div>

      <section className="card gantt-card">
        <div className="gantt-scroll">
          <div className="gantt-grid">
            <div className="gantt-corner label">Milestone</div>
            <div className="gantt-axis-row">
              {ticks.map((tick, i) => (
                <span className="gantt-tick-label" style={{ left: `${tick.percent}%` }} key={i}>
                  {tick.label}
                </span>
              ))}
            </div>

            {milestones.map((m) => {
              const startPct = percentForIso(m.plannedStart, range);
              const endPct = Math.max(percentForIso(m.plannedEnd, range), startPct);
              const pct = milestoneProgress(m);
              const done = milestoneStatus(m) === 'done';

              return (
                <Fragment key={m.id}>
                  <div className="gantt-row-label">
                    <div className="gantt-row-title-line">
                      <span className="timeline-title">{m.title || 'Untitled'}</span>
                      <StatusStamp milestone={m} />
                    </div>
                    <span className="gantt-row-dates mono">
                      {formatDate(m.plannedStart, { withYear: false })} – {formatDate(m.plannedEnd, { withYear: false })}
                    </span>
                  </div>
                  <div className="gantt-row-track">
                    {ticks.map((tick, i) => (
                      <span className="gantt-gridline" style={{ left: `${tick.percent}%` }} key={i} />
                    ))}
                    {todayPercent !== null && (
                      <span className="gantt-marker gantt-marker-today" style={{ left: `${todayPercent}%` }} />
                    )}
                    {targetPercent !== null && (
                      <span className="gantt-marker gantt-marker-target" style={{ left: `${targetPercent}%` }} />
                    )}
                    <div
                      className="gantt-bar"
                      style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                    >
                      <div
                        className={`gantt-bar-fill${done ? ' is-complete' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                      {m.tasks.map((task, i) => (
                        <span
                          key={task.id}
                          className={`gantt-task-tick gantt-task-${task.status}`}
                          style={{ left: `${((i + 0.5) / m.tasks.length) * 100}%` }}
                          title={task.title}
                        />
                      ))}
                    </div>
                    <span
                      className="gantt-row-pct mono"
                      style={
                        endPct > 88
                          ? { right: `calc(${100 - startPct}% + 10px)` }
                          : { left: `calc(${endPct}% + 10px)` }
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="gantt-legend">
          <span className="gantt-legend-item">
            <span className="gantt-task-tick gantt-task-done gantt-legend-dot" /> Task done
          </span>
          <span className="gantt-legend-item">
            <span className="gantt-task-tick gantt-task-in-progress gantt-legend-dot" /> In progress
          </span>
          <span className="gantt-legend-item">
            <span className="gantt-task-tick gantt-task-todo gantt-legend-dot" /> To do
          </span>
          {todayPercent !== null && (
            <span className="gantt-legend-item">
              <span className="gantt-legend-line gantt-marker-today" /> Today
            </span>
          )}
          {targetPercent !== null && (
            <span className="gantt-legend-item">
              <span className="gantt-legend-line gantt-marker-target" /> Target
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
