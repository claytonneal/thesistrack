import { useRef } from 'react';
import { UploadIcon } from './Icons';

interface EmptyStateProps {
  onNew: () => void;
  onSample: () => void;
  onLoadFile: (file: File) => void;
  error: string | null;
}

export function EmptyState({ onNew, onSample, onLoadFile, error }: EmptyStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="empty-state">
      <div className="card empty-state-card">
        <span className="empty-state-mark">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M17.5 3.5 6.7 14.3c-1 1-1.4 2.8-1.7 5.4 2.6-.3 4.4-.7 5.4-1.7L21.2 7.2"
              stroke="#f6efdd"
              strokeWidth="1.7"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <h1>Begin your thesis plan</h1>
        <p>
          Lay out milestones, track progress against them, and adjust as your research evolves.
          Everything stays in your browser — save your plan to a file whenever you want a copy.
        </p>
        <div className="empty-state-actions">
          <button className="btn btn-primary" onClick={onNew}>
            Start a new plan
          </button>
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon className="icon" />
            Load a saved plan
          </button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onSample}>
          Or try it with example data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLoadFile(file);
            e.target.value = '';
          }}
        />
        {error && (
          <p className="empty-state-note" style={{ color: 'var(--rust)' }}>
            {error}
          </p>
        )}
        <p className="empty-state-note">No account. No server. Nothing leaves your browser.</p>
      </div>
    </div>
  );
}
