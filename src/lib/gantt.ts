import type { ThesisPlan } from '../types';
import { parseIsoDate, todayIso } from './date';

export interface GanttRange {
  start: Date;
  end: Date;
}

export interface GanttTick {
  label: string;
  percent: number;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function computeGanttRange(plan: ThesisPlan): GanttRange {
  const starts: Date[] = [];
  const ends: Date[] = [];

  if (plan.meta.startDate) starts.push(parseIsoDate(plan.meta.startDate));
  if (plan.meta.targetDate) ends.push(parseIsoDate(plan.meta.targetDate));

  for (const m of plan.milestones) {
    if (m.plannedStart) starts.push(parseIsoDate(m.plannedStart));
    if (m.plannedEnd) ends.push(parseIsoDate(m.plannedEnd));
  }

  const today = parseIsoDate(todayIso());
  if (starts.length === 0) starts.push(today);
  if (ends.length === 0) ends.push(today);

  const start = new Date(Math.min(...starts.map((d) => d.getTime())));
  let end = new Date(Math.max(...ends.map((d) => d.getTime()), ...starts.map((d) => d.getTime())));

  if (end.getTime() <= start.getTime()) {
    end = addDays(start, 30);
  }

  return { start: addDays(start, -3), end: addDays(end, 3) };
}

export function percentForDate(date: Date, range: GanttRange): number {
  const span = range.end.getTime() - range.start.getTime();
  if (span <= 0) return 0;
  const pct = ((date.getTime() - range.start.getTime()) / span) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function percentForIso(iso: string, range: GanttRange): number {
  return percentForDate(parseIsoDate(iso), range);
}

const MIN_TICK_GAP_PERCENT = 5;

export function monthTicks(range: GanttRange): GanttTick[] {
  const ticks: GanttTick[] = [];
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  let guard = 0;
  while (cursor.getTime() <= range.end.getTime() && guard < 60) {
    const percent = percentForDate(cursor, range);
    const prev = ticks[ticks.length - 1];
    if (!prev || percent - prev.percent >= MIN_TICK_GAP_PERCENT) {
      ticks.push({ label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), percent });
    }
    cursor.setMonth(cursor.getMonth() + 1);
    guard += 1;
  }
  return ticks;
}

export function isWithinRange(iso: string, range: GanttRange): boolean {
  if (!iso) return false;
  const t = parseIsoDate(iso).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}
