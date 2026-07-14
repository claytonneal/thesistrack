import { useState } from 'react';
import type { Milestone, ThesisPlan, ThesisTask } from '../types';
import { makeId } from '../lib/id';
import { todayIso } from '../lib/date';
import { PlusIcon, TrashIcon } from './Icons';

interface PlanEditorProps {
  plan: ThesisPlan;
  onChange: (updater: (plan: ThesisPlan) => ThesisPlan) => void;
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

export function PlanEditor({ plan, onChange }: PlanEditorProps) {
  function updateMeta<K extends keyof ThesisPlan['meta']>(key: K, value: ThesisPlan['meta'][K]) {
    onChange((p) => ({ ...p, meta: { ...p.meta, [key]: value } }));
  }

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    onChange((p) => ({
      ...p,
      milestones: p.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  function addMilestone() {
    const milestone = newMilestone();
    onChange((p) => ({ ...p, milestones: [...p.milestones, milestone] }));
  }

  function removeMilestone(id: string) {
    onChange((p) => ({ ...p, milestones: p.milestones.filter((m) => m.id !== id) }));
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
            />
          </div>
          <div className="field">
            <label className="label">Your name</label>
            <input
              className="input"
              placeholder="Jane Doe"
              value={plan.meta.studentName}
              onChange={(e) => updateMeta('studentName', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">Advisor</label>
            <input
              className="input"
              placeholder="Prof. Smith"
              value={plan.meta.advisor}
              onChange={(e) => updateMeta('advisor', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">Institution / department</label>
            <input
              className="input"
              placeholder="Dept. of..."
              value={plan.meta.institution}
              onChange={(e) => updateMeta('institution', e.target.value)}
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
            />
          </div>
          <div className="field">
            <label className="label">Target submission date</label>
            <input
              className="input date-input"
              type="date"
              value={plan.meta.targetDate}
              onChange={(e) => updateMeta('targetDate', e.target.value)}
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
          onUpdate={(patch) => updateMilestone(milestone.id, patch)}
          onRemove={() => removeMilestone(milestone.id)}
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
  onUpdate: (patch: Partial<Milestone>) => void;
  onRemove: () => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function updateTask(id: string, patch: Partial<ThesisTask>) {
    onUpdate({ tasks: milestone.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function removeTask(id: string) {
    onUpdate({ tasks: milestone.tasks.filter((t) => t.id !== id) });
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    onUpdate({ tasks: [...milestone.tasks, { id: makeId(), title, status: 'todo' }] });
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
          />
        </div>
        <div className="field">
          <label className="label">Planned end</label>
          <input
            className="input date-input"
            type="date"
            value={milestone.plannedEnd}
            onChange={(e) => onUpdate({ plannedEnd: e.target.value })}
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
              />
              <button className="btn btn-ghost btn-sm" onClick={() => removeTask(task.id)} aria-label="Remove task">
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
