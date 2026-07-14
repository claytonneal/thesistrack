import { makeId } from './id';
import { nowIso } from './date';
import type { HistoryEvent, HistoryEventType, ThesisPlan } from '../types';

export function appendHistory(plan: ThesisPlan, type: HistoryEventType, summary: string): ThesisPlan {
  const event: HistoryEvent = { id: makeId(), type, at: nowIso(), summary };
  return { ...plan, history: [event, ...plan.history] };
}
