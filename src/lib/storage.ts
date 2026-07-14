import type { HistoryEvent, Milestone, ThesisPlan } from '../types';
import { makeId } from './id';
import { nowIso, todayIso } from './date';

const LOCAL_STORAGE_KEY = 'thesistrack.plan.v1';

export function createEmptyPlan(): ThesisPlan {
  const now = nowIso();
  return {
    formatVersion: 2,
    meta: {
      title: '',
      studentName: '',
      advisor: '',
      institution: '',
      startDate: todayIso(),
      targetDate: '',
    },
    milestones: [],
    history: [],
    createdAt: now,
    updatedAt: now,
  };
}

function sampleHistory(milestones: Milestone[]): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  for (const m of milestones) {
    const addedAt = new Date(`${m.plannedStart}T09:00:00.000Z`);
    events.push({
      id: makeId(),
      type: 'milestone-added',
      at: addedAt.toISOString(),
      summary: `Added milestone "${m.title}"`,
    });
    for (const t of m.tasks) {
      events.push({
        id: makeId(),
        type: 'task-added',
        at: addedAt.toISOString(),
        summary: `Added task "${t.title}" to milestone "${m.title}"`,
      });
      if (t.status === 'done') {
        const completedAt = new Date(addedAt);
        completedAt.setDate(completedAt.getDate() + 3);
        events.push({
          id: makeId(),
          type: 'task-completed',
          at: completedAt.toISOString(),
          summary: `Completed task "${t.title}" in milestone "${m.title}"`,
        });
      }
    }
  }
  return events;
}

export function createSamplePlan(): ThesisPlan {
  const now = nowIso();
  const today = new Date();
  const iso = (offsetWeeks: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetWeeks * 7);
    return d.toISOString().slice(0, 10);
  };

  const milestone = (
    title: string,
    description: string,
    startWeek: number,
    endWeek: number,
    tasks: Array<[string, Milestone['tasks'][number]['status']]>,
  ): Milestone => ({
    id: makeId(),
    title,
    description,
    plannedStart: iso(startWeek),
    plannedEnd: iso(endWeek),
    completedAt: null,
    tasks: tasks.map(([t, status]) => ({ id: makeId(), title: t, status })),
    log: [],
  });

  const milestones = [
    milestone(
      'Literature Review',
      'Survey prior work on fairness metrics and hiring algorithms.',
      -2,
      4,
      [
        ['Collect 40+ core papers', 'done'],
        ['Draft synthesis matrix', 'done'],
        ['Write review chapter', 'in-progress'],
      ],
    ),
    milestone(
      'Research Proposal & Methodology',
      'Define research questions, hypotheses, and evaluation methodology.',
      4,
      8,
      [
        ['Finalize research questions', 'done'],
        ['Design evaluation methodology', 'in-progress'],
        ['Committee proposal defense', 'todo'],
      ],
    ),
    milestone(
      'Data Collection',
      'Assemble and anonymize hiring dataset with advisor approval.',
      8,
      14,
      [
        ['IRB approval', 'todo'],
        ['Source dataset partners', 'todo'],
        ['Build preprocessing pipeline', 'todo'],
      ],
    ),
    milestone(
      'Analysis & Experiments',
      'Run fairness audits across candidate models.',
      14,
      22,
      [
        ['Implement baseline models', 'todo'],
        ['Run fairness metrics suite', 'todo'],
        ['Statistical significance testing', 'todo'],
      ],
    ),
    milestone(
      'Draft Writing',
      'Write full thesis draft chapters 1 through 6.',
      22,
      28,
      [
        ['Chapters 1-3 draft', 'todo'],
        ['Chapters 4-6 draft', 'todo'],
        ['Advisor review pass', 'todo'],
      ],
    ),
    milestone('Defense & Submission', 'Final revisions, defense, and submission.', 28, 30, [
      ['Schedule defense', 'todo'],
      ['Final revisions', 'todo'],
      ['Submit to registrar', 'todo'],
    ]),
  ];

  return {
    formatVersion: 2,
    meta: {
      title: 'Algorithmic Bias in Automated Hiring Systems',
      studentName: 'Jordan Avery',
      advisor: 'Prof. R. Whitfield',
      institution: 'Dept. of Computer Science',
      startDate: iso(-2),
      targetDate: iso(30),
    },
    milestones,
    history: sampleHistory(milestones),
    createdAt: now,
    updatedAt: now,
  };
}

export function saveToLocalStorage(plan: ThesisPlan): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — silently skip autosave
  }
}

export function loadFromLocalStorage(): ThesisPlan | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return validatePlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'thesis-plan';
}

export function downloadPlan(plan: ThesisPlan): void {
  const filename = `${slugify(plan.meta.title)}.thesistrack.json`;
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export class PlanFileError extends Error {}

const HISTORY_EVENT_TYPES = new Set([
  'milestone-added',
  'milestone-edited',
  'milestone-deleted',
  'milestone-completed',
  'milestone-reopened',
  'task-added',
  'task-edited',
  'task-deleted',
  'task-completed',
  'task-reopened',
  'progress-logged',
  'progress-edited',
  'progress-deleted',
  'plan-details-edited',
]);

export function validatePlan(data: unknown): ThesisPlan {
  if (!data || typeof data !== 'object') {
    throw new PlanFileError('File does not contain a valid ThesisTrack plan.');
  }
  const obj = data as Record<string, unknown>;
  if (!obj.meta || typeof obj.meta !== 'object') {
    throw new PlanFileError('File is missing thesis details.');
  }
  if (!Array.isArray(obj.milestones)) {
    throw new PlanFileError('File is missing a milestones list.');
  }
  const meta = obj.meta as Record<string, unknown>;

  const milestones: Milestone[] = obj.milestones.map((raw): Milestone => {
    const m = raw as Record<string, unknown>;
    const tasks = Array.isArray(m.tasks) ? m.tasks : [];
    const log = Array.isArray(m.log) ? m.log : [];
    return {
      id: typeof m.id === 'string' ? m.id : makeId(),
      title: typeof m.title === 'string' ? m.title : 'Untitled milestone',
      description: typeof m.description === 'string' ? m.description : '',
      plannedStart: typeof m.plannedStart === 'string' ? m.plannedStart : todayIso(),
      plannedEnd: typeof m.plannedEnd === 'string' ? m.plannedEnd : todayIso(),
      completedAt: typeof m.completedAt === 'string' ? m.completedAt : null,
      tasks: tasks.map((raw2) => {
        const t = raw2 as Record<string, unknown>;
        return {
          id: typeof t.id === 'string' ? t.id : makeId(),
          title: typeof t.title === 'string' ? t.title : 'Untitled task',
          status: t.status === 'done' || t.status === 'in-progress' ? t.status : 'todo',
        };
      }),
      log: log.map((raw3) => {
        const l = raw3 as Record<string, unknown>;
        return {
          id: typeof l.id === 'string' ? l.id : makeId(),
          date: typeof l.date === 'string' ? l.date : todayIso(),
          note: typeof l.note === 'string' ? l.note : '',
        };
      }),
    };
  });

  const historyRaw = Array.isArray(obj.history) ? obj.history : [];
  const history: HistoryEvent[] = historyRaw.map((raw): HistoryEvent => {
    const h = raw as Record<string, unknown>;
    return {
      id: typeof h.id === 'string' ? h.id : makeId(),
      type: typeof h.type === 'string' && HISTORY_EVENT_TYPES.has(h.type) ? (h.type as HistoryEvent['type']) : 'plan-details-edited',
      at: typeof h.at === 'string' ? h.at : nowIso(),
      summary: typeof h.summary === 'string' ? h.summary : 'Unknown change',
    };
  });

  return {
    formatVersion: 2,
    meta: {
      title: typeof meta.title === 'string' ? meta.title : '',
      studentName: typeof meta.studentName === 'string' ? meta.studentName : '',
      advisor: typeof meta.advisor === 'string' ? meta.advisor : '',
      institution: typeof meta.institution === 'string' ? meta.institution : '',
      startDate: typeof meta.startDate === 'string' ? meta.startDate : todayIso(),
      targetDate: typeof meta.targetDate === 'string' ? meta.targetDate : '',
    },
    milestones,
    history,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : nowIso(),
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : nowIso(),
  };
}

export function readPlanFile(file: File): Promise<ThesisPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new PlanFileError('Could not read that file.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(validatePlan(parsed));
      } catch (err) {
        if (err instanceof PlanFileError) reject(err);
        else reject(new PlanFileError('That file is not valid JSON.'));
      }
    };
    reader.readAsText(file);
  });
}
