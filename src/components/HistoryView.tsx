import type { HistoryEvent, HistoryEventType, ThesisPlan } from '../types';
import { formatDate, formatTime, parseIsoDate, todayIso, toIsoDate } from '../lib/date';

type Category = 'create' | 'edit' | 'delete' | 'complete' | 'reopen';

const CATEGORY: Record<HistoryEventType, Category> = {
  'milestone-added': 'create',
  'milestone-edited': 'edit',
  'milestone-deleted': 'delete',
  'milestone-completed': 'complete',
  'milestone-reopened': 'reopen',
  'task-added': 'create',
  'task-edited': 'edit',
  'task-deleted': 'delete',
  'task-completed': 'complete',
  'task-reopened': 'reopen',
  'progress-logged': 'create',
  'progress-edited': 'edit',
  'progress-deleted': 'delete',
  'plan-details-edited': 'edit',
};

function dayLabel(dayIso: string): string {
  const today = todayIso();
  const yesterday = toIsoDate(new Date(parseIsoDate(today).getTime() - 86400000));
  if (dayIso === today) return 'Today';
  if (dayIso === yesterday) return 'Yesterday';
  return formatDate(dayIso);
}

function groupByDay(events: HistoryEvent[]): Array<[string, HistoryEvent[]]> {
  const groups: Array<[string, HistoryEvent[]]> = [];
  for (const event of events) {
    const day = event.at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last[0] === day) last[1].push(event);
    else groups.push([day, [event]]);
  }
  return groups;
}

export function HistoryView({ plan }: { plan: ThesisPlan }) {
  const events = [...plan.history].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div>
      <div className="section-heading">
        <h2>History</h2>
        <span className="label">
          {events.length} change{events.length === 1 ? '' : 's'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="card history-empty">
          No changes recorded yet. Every edit, completion, and log entry will appear here as you work.
        </div>
      ) : (
        groupByDay(events).map(([day, dayEvents]) => (
          <div className="history-group" key={day}>
            <div className="history-day mono">{dayLabel(day)}</div>
            <div className="card history-list">
              {dayEvents.map((event) => (
                <div className="history-row" key={event.id}>
                  <span className={`history-dot history-dot-${CATEGORY[event.type]}`} />
                  <span className="history-time mono">{formatTime(event.at)}</span>
                  <span className="history-summary">{event.summary}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
