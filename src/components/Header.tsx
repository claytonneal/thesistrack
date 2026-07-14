import { useRef } from 'react';
import type { ViewId } from '../types';
import { DownloadIcon, PlusIcon, UploadIcon, XIcon } from './Icons';

interface HeaderProps {
  hasPlan: boolean;
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
  onNew: () => void;
  onClose: () => void;
  onSave: () => void;
  onLoadFile: (file: File) => void;
}

const TABS: Array<{ id: ViewId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'plan', label: 'Plan' },
  { id: 'progress', label: 'Progress' },
  { id: 'gantt', label: 'Gantt' },
  { id: 'history', label: 'History' },
];

export function Header({ hasPlan, activeView, onChangeView, onNew, onClose, onSave, onLoadFile }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <span className="brand-mark">
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
          <span className="brand-word">
            Thesis<em>Track</em>
          </span>
        </div>
        <div className="toolbar">
          {hasPlan && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>
                <XIcon className="icon" />
                Close
              </button>
              <div className="toolbar-divider" />
            </>
          )}
          <button className="btn btn-ghost" onClick={onNew}>
            <PlusIcon className="icon" />
            New
          </button>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon className="icon" />
            Load
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
          <div className="toolbar-divider" />
          <button className="btn btn-primary" onClick={onSave} disabled={!hasPlan}>
            <DownloadIcon className="icon" />
            Save plan
          </button>
        </div>
      </div>
      {hasPlan && (
        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab${activeView === tab.id ? ' is-active' : ''}`}
              onClick={() => onChangeView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
