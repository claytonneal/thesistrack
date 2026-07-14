import { useRef, useState } from 'react';
import type { HistoryEventType, Milestone, ThesisPlan, ThesisTask } from '../types';
import { makeId } from '../lib/id';
import { todayIso } from '../lib/date';
import { appendHistory } from '../lib/history';
import { PlusIcon, TrashIcon } from './Icons';

interface PlanEditorProps {
  plan: ThesisPlan;
  onChange: (updater: (plan: ThesisPlan) => ThesisPlan) => void;
}

interface HistoryInput {
  type: HistoryEventType;
  summary: string;
}

function newMilestone(): Milestone {
  const today = todayIso();
  return {
    id: makeId(),
    title: '',
    description: '',
    plannedStart: today,
    plannedEnd: today,
    completedAt: null,
    tasks: [],
    log: [],
  };
}

const META_LABELS: Record<keyof ThesisPlan['meta'], string> = {
  title: 'working title',
  studentName: 'your name',
  advisor: 'advisor',
  institution: 'institution',
  startDate: 'start date',
  targetDate: 'target submission date',
};

export function PlanEditor({ plan, onChange }: PlanEditorProps) {
  const metaSnapshot = useRef<Partial<Record<keyof ThesisPlan['meta'], string>>>({});

  function updateMeta<K extends keyof ThesisPlan['meta']>(key: K, value: ThesisPlan['meta'][K]) {
    onChange((p) => ({ ...p, meta: { ...p.meta, [key]: value } }));
  }

  function focusMeta(key: keyof ThesisPlan['meta'], value: string) {
    metaSnapshot.current[key] = value;
  }

  function blurMeta(key: keyof ThesisPlan['meta']) {
    const before = metaSnapshot.current[key];
    delete metaSnapshot.current[key];
    const after = plan.meta[key];
    if (before === undefined || before === after) return;
    onChange((p) => appendHistory(p, 'plan-details-edited', `Updated ${META_LABELS[key]}`));
  }

  function updateMilestone(id: string, patch: Partial<Milestone>, event?: HistoryInput) {
    onChange((p) => {
      const next = { ...p, milestones: p.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) };
      return event ? appendHistory(next, event.type, event.summary) : next;
    });
  }

  function addMilestone() {
    const milestone = newMilestone();
    onChange((p) =>
      appendHistory({ ...p, milestones: [...p.milestones, milestone] }, 'milestone-added', 'Added a new milestone'),
    );
  }

  function removeMilestone(milestone: Milestone) {
    onChange((p) =>
      appendHistory(
        { ...p, milestones: p.milestones.filter((m) => m.id !== milestone.id) },
        'milestone-deleted',
        `Deleted milestone "${milestone.title || 'Untitled milestone'}"`,
      ),
    );
  }

  return (
    <div className="stack">
      <section className="card meta-card">
        <div className="section-heading">
          <h2>Thesis details</h2>
        </div>
        <div className="meta-grid">
          <div className="field span-2">
            <label className="label">Working title</label>
            <input
              className="input"
              placeholder="The title of your thesis"
              value={plan.meta.title}
              onChange={(e) => updateMeta('title', e.target.value)}
              onFocus={(e) => focusMeta('title', e.target.value)}
              onBlur={() => blurMeta('title')}
            />
          </div>
          <div className="field">
            <label className="label">Your name</label>
            <input
              className="input"
              placeholder="Jane Doe"
              value={plan.meta.studentName}
              onChange={(e) => updateMeta('studentName', e.target.value)}
              onFocus={(e) => focusMeta('studentName', e.target.value)}
              onBlur={() => blurMeta('studentName')}
            />
          </div>
          <div className="field">
            <label className="label">Advisor</label>
            <input
              className="input"
              placeholder="Prof. Smith"
              value={plan.meta.advisor}
              onChange={(e) => updateMeta('advisor', e.target.value)}
              onFocus={(e) => focusMeta('advisor', e.target.value)}
              onBlur={() => blurMeta('advisor')}
            />
          </div>
          <div className="field">
            <label className="label">Institution / department</label>
            <input
              className="input"
              placeholder="Dept. of..."
              value={plan.meta.institution}
              onChange={(e) => updateMeta('institution', e.target.value)}
              onFocus={(e) => focusMeta('institution', e.target.value)}
              onBlur={() => blurMeta('institution')}
            />
          </div>
          <div className="field" />
          <div className="field">
            <label className="label">Start date</label>
            <input
              className="input date-input"
              type="date"
              value={plan.meta.startDate}
              onChange={(e) => updateMeta('startDate', e.target.value)}
              onFocus={(e) => focusMeta('startDate', e.target.value)}
              onBlur={() => blurMeta('startDate')}
            />
          </div>
          <div className="field">
            <label className="label">Target submission date</label>
            <input
              className="input date-input"
              type="date"
              value={plan.meta.targetDate}
              onChange={(e) => updateMeta('targetDate', e.target.value)}
              onFocus={(e) => focusMeta('targetDate', e.target.value)}
              onBlur={() => blurMeta('targetDate')}
            />
          </div>
        </div>
      </section>

      <div className="section-heading">
        <h2>Milestones</h2>
        <span className="label">{plan.milestones.length} total</span>
      </div>

      {plan.milestones.map((milestone) => (
        <MilestoneEditor
          key={milestone.id}
          milestone={milestone}
          onUpdate={(patch, event) => updateMilestone(milestone.id, patch, event)}
          onRemove={() => removeMilestone(milestone)}
        />
      ))}

      <button className="add-milestone-btn" onClick={addMilestone}>
        + Add milestone
      </button>
    </div>
  );
}

function MilestoneEditor({
  milestone,
  onUpdate,
  onRemove,
}: {
  milestone: Milestone;
  onUpdate: (patch: Partial<Milestone>, event?: HistoryInput) => void;
  onRemove: () => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fieldSnapshot = useRef<Partial<Record<'title' | 'description' | 'plannedStart' | 'plannedEnd', string>>>({});
  const taskSnapshot = useRef<Record<string, string>>({});

  function focusField(key: 'title' | 'description' | 'plannedStart' | 'plannedEnd', value: string) {
    fieldSnapshot.current[key] = value;
  }

  function blurField(key: 'title' | 'description' | 'plannedStart' | 'plannedEnd') {
    const before = fieldSnapshot.current[key];
    delete fieldSnapshot.current[key];
    const after = milestone[key];
    if (before === undefined || before === after) return;

    if (key === 'title') {
      onUpdate({}, { type: 'milestone-edited', summary: `Renamed milestone "${before || 'Untitled milestone'}" to "${after || 'Untitled milestone'}"` });
    } else if (key === 'description') {
      onUpdate({}, { type: 'milestone-edited', summary: `Updated description for milestone "${milestone.title || 'Untitled milestone'}"` });
    } else {
      const label = key === 'plannedStart' ? 'planned start' : 'planned end';
      onUpdate({}, { type: 'milestone-edited', summary: `Updated ${label} for milestone "${milestone.title || 'Untitled milestone'}"` });
    }
  }

  function updateTask(id: string, patch: Partial<ThesisTask>) {
    onUpdate({ tasks: milestone.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function focusTask(id: string, value: string) {
    taskSnapshot.current[id] = value;
  }

  function blurTask(id: string) {
    const before = taskSnapshot.current[id];
    delete taskSnapshot.current[id];
    const task = milestone.tasks.find((t) => t.id === id);
    if (!task || before === undefined || before === task.title) return;
    onUpdate(
      {},
      {
        type: 'task-edited',
        summary: `Renamed task "${before || 'Untitled task'}" to "${task.title || 'Untitled task'}" in milestone "${milestone.title || 'Untitled milestone'}"`,
      },
    );
  }

  function removeTask(task: ThesisTask) {
    onUpdate(
      { tasks: milestone.tasks.filter((t) => t.id !== task.id) },
      {
        type: 'task-deleted',
        summary: `Deleted task "${task.title || 'Untitled task'}" from milestone "${milestone.title || 'Untitled milestone'}"`,
      },
    );
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    onUpdate(
      { tasks: [...milestone.tasks, { id: makeId(), title, status: 'todo' }] },
      { type: 'task-added', summary: `Added task "${title}" to milestone "${milestone.title || 'Untitled milestone'}"` },
    );
    setNewTaskTitle('');
  }

  return (
    <section className="card milestone-card">
      <div className="milestone-card-head">
        <div className="milestone-title-field field">
          <label className="label">Milestone</label>
          <input
            className="input"
            placeholder="e.g. Literature Review"
            value={milestone.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onFocus={(e) => focusField('title', e.target.value)}
            onBlur={() => blurField('title')}
          />
        </div>
        {confirmingDelete ? (
          <div style={{ display: 'flex', gap: '0.4rem', flex: 'none' }}>
            <button className="btn btn-danger btn-sm" onClick={onRemove}>
              Confirm delete
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(true)} aria-label="Delete milestone">
            <TrashIcon className="icon" />
          </button>
        )}
      </div>

      <div className="field">
        <label className="label">Description</label>
        <textarea
          className="textarea"
          rows={2}
          placeholder="What does this milestone cover?"
          value={milestone.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          onFocus={(e) => focusField('description', e.target.value)}
          onBlur={() => blurField('description')}
        />
      </div>

      <div className="milestone-date-grid">
        <div className="field">
          <label className="label">Planned start</label>
          <input
            className="input date-input"
            type="date"
            value={milestone.plannedStart}
            onChange={(e) => onUpdate({ plannedStart: e.target.value })}
            onFocus={(e) => focusField('plannedStart', e.target.value)}
            onBlur={() => blurField('plannedStart')}
          />
        </div>
        <div className="field">
          <label className="label">Planned end</label>
          <input
            className="input date-input"
            type="date"
            value={milestone.plannedEnd}
            onChange={(e) => onUpdate({ plannedEnd: e.target.value })}
            onFocus={(e) => focusField('plannedEnd', e.target.value)}
            onBlur={() => blurField('plannedEnd')}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Tasks</label>
        <div className="task-list">
          {milestone.tasks.map((task) => (
            <div className="task-row" key={task.id}>
              <input
                className="input"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                onFocus={(e) => focusTask(task.id, e.target.value)}
                onBlur={() => blurTask(task.id)}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => removeTask(task)} aria-label="Remove task">
                <TrashIcon className="icon" />
              </button>
            </div>
          ))}
        </div>
        <div className="add-row" style={{ marginTop: '0.6rem' }}>
          <input
            className="input"
            placeholder="Add a task…"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
              }
            }}
          />
          <button className="btn btn-outline btn-sm" onClick={addTask}>
            <PlusIcon className="icon" />
            Add
          </button>
        </div>
      </div>
    </section>
  );
}
