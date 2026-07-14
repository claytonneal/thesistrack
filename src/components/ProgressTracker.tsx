import { useState } from 'react';
import type { Milestone, ProgressEntry, ThesisPlan } from '../types';
import { makeId } from '../lib/id';
import { formatDate, todayIso } from '../lib/date';
import { milestoneProgress, orderedMilestones } from '../lib/progress';
import { ProgressBar } from './ProgressBar';
import { StatusStamp } from './StatusStamp';
import { PlusIcon } from './Icons';

interface ProgressTrackerProps {
  plan: ThesisPlan;
  onChange: (updater: (plan: ThesisPlan) => ThesisPlan) => void;
}

export function ProgressTracker({ plan, onChange }: ProgressTrackerProps) {
  const milestones = orderedMilestones(plan);
  const [activeId, setActiveId] = useState<string | null>(milestones[0]?.id ?? null);
  const active = milestones.find((m) => m.id === activeId) ?? milestones[0] ?? null;

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    onChange((p) => ({
      ...p,
      milestones: p.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  if (milestones.length === 0) {
    return (
      <div className="card progress-empty">
        No milestones to track yet. Add some in the Plan tab first.
      </div>
    );
  }

  return (
    <div>
      <div className="milestone-nav">
        {milestones.map((m) => (
          <button
            key={m.id}
            className={`milestone-chip${m.id === active?.id ? ' is-active' : ''}`}
            onClick={() => setActiveId(m.id)}
          >
            {m.title || 'Untitled'}
            <span className="mono">{milestoneProgress(m)}%</span>
          </button>
        ))}
      </div>

      {active && (
        <MilestoneProgress
          milestone={active}
          onUpdate={(patch) => updateMilestone(active.id, patch)}
        />
      )}
    </div>
  );
}

function MilestoneProgress({
  milestone,
  onUpdate,
}: {
  milestone: Milestone;
  onUpdate: (patch: Partial<Milestone>) => void;
}) {
  const [noteDate, setNoteDate] = useState(todayIso());
  const [noteText, setNoteText] = useState('');
  const pct = milestoneProgress(milestone);
  const isDone = Boolean(milestone.completedAt);

  function toggleTask(id: string) {
    onUpdate({
      tasks: milestone.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
      ),
    });
  }

  function toggleComplete() {
    onUpdate({ completedAt: isDone ? null : todayIso() });
  }

  function addLogEntry() {
    const note = noteText.trim();
    if (!note) return;
    const entry: ProgressEntry = { id: makeId(), date: noteDate, note };
    onUpdate({ log: [entry, ...milestone.log] });
    setNoteText('');
  }

  const sortedLog = [...milestone.log].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="card progress-milestone">
      <div className="progress-milestone-head">
        <div>
          <div className="progress-milestone-title">{milestone.title || 'Untitled milestone'}</div>
          <div className="progress-milestone-dates">
            {formatDate(milestone.plannedStart, { withYear: false })} – {formatDate(milestone.plannedEnd, { withYear: false })}
          </div>
        </div>
        <StatusStamp milestone={milestone} />
      </div>

      {milestone.description && <p className="progress-milestone-desc">{milestone.description}</p>}

      <div className="progress-track">
        <ProgressBar percent={pct} />
        <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
          {pct}%
        </span>
      </div>

      <button className={`btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-sm`} onClick={toggleComplete} style={{ alignSelf: 'flex-start' }}>
        {isDone ? 'Reopen milestone' : 'Mark milestone complete'}
      </button>

      {milestone.tasks.length > 0 && (
        <>
          <hr className="divider" />
          <div className="field">
            <label className="label">Tasks</label>
            <div className="task-list" style={{ marginTop: '0.5rem' }}>
              {milestone.tasks.map((task) => (
                <label className={`checkbox-row task-row${task.status === 'done' ? ' is-done' : ''}`} key={task.id}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span>{task.title}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <hr className="divider" />

      <div className="field">
        <label className="label">Progress log</label>
        <div className="log-list" style={{ marginTop: '0.6rem' }}>
          {sortedLog.length === 0 && <p className="log-empty">No entries yet. Note what you worked on below.</p>}
          {sortedLog.map((entry) => (
            <div className="log-entry" key={entry.id}>
              <span className="log-entry-date mono">{formatDate(entry.date, { withYear: false })}</span>
              <span className="log-entry-note">{entry.note}</span>
            </div>
          ))}
        </div>
        <div className="log-add" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label className="label">Date</label>
            <input
              className="input date-input"
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">What did you work on?</label>
            <input
              className="input"
              placeholder="e.g. Finished draft of section 2.1"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLogEntry();
                }
              }}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={addLogEntry}>
            <PlusIcon className="icon" />
            Log
          </button>
        </div>
      </div>
    </section>
  );
}
