import { useEffect, useRef, useState } from 'react';
import type { ThesisPlan, ViewId } from './types';
import {
  clearLocalStorage,
  createEmptyPlan,
  createSamplePlan,
  downloadPlan,
  loadFromLocalStorage,
  PlanFileError,
  readPlanFile,
  saveToLocalStorage,
} from './lib/storage';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { Overview } from './components/Overview';
import { PlanEditor } from './components/PlanEditor';
import { ProgressTracker } from './components/ProgressTracker';
import { GanttChart } from './components/GanttChart';
import { ConfirmDialog } from './components/ConfirmDialog';
import './App.css';

type DialogState =
  | { kind: 'confirm'; title: string; message: string; confirmLabel: string; onConfirm: () => void }
  | { kind: 'alert'; title: string; message: string };

function App() {
  const [plan, setPlan] = useState<ThesisPlan | null>(() => loadFromLocalStorage());
  const [view, setView] = useState<ViewId>('overview');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const lastSavedSnapshot = useRef<string | null>(plan ? JSON.stringify(plan) : null);

  useEffect(() => {
    if (plan) saveToLocalStorage(plan);
  }, [plan]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!plan) return;
      const dirty = JSON.stringify(plan) !== lastSavedSnapshot.current;
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [plan]);

  function updatePlan(updater: (p: ThesisPlan) => ThesisPlan) {
    setPlan((prev) => {
      if (!prev) return prev;
      return { ...updater(prev), updatedAt: new Date().toISOString() };
    });
  }

  function handleNew() {
    function proceed() {
      const fresh = createEmptyPlan();
      setPlan(fresh);
      lastSavedSnapshot.current = null;
      setLoadError(null);
      setView('plan');
    }
    const dirty = Boolean(plan) && JSON.stringify(plan) !== lastSavedSnapshot.current;
    if (dirty) {
      setDialog({
        kind: 'confirm',
        title: 'Start a new plan?',
        message: 'You have unsaved changes. Starting a new plan will replace your current one — save it to a file first if you want to keep it.',
        confirmLabel: 'Discard & start new',
        onConfirm: proceed,
      });
      return;
    }
    proceed();
  }

  function handleClose() {
    function proceed() {
      setPlan(null);
      lastSavedSnapshot.current = null;
      setLoadError(null);
      setView('overview');
      clearLocalStorage();
    }
    const dirty = Boolean(plan) && JSON.stringify(plan) !== lastSavedSnapshot.current;
    if (dirty) {
      setDialog({
        kind: 'confirm',
        title: 'Close this plan?',
        message: 'You have unsaved changes. Save it to a file first if you want a portable copy.',
        confirmLabel: 'Close without saving',
        onConfirm: proceed,
      });
      return;
    }
    proceed();
  }

  function handleSample() {
    const sample = createSamplePlan();
    setPlan(sample);
    lastSavedSnapshot.current = null;
    setLoadError(null);
    setView('overview');
  }

  function handleSave() {
    if (!plan) return;
    downloadPlan(plan);
    lastSavedSnapshot.current = JSON.stringify(plan);
  }

  async function handleLoadFile(file: File) {
    try {
      const loaded = await readPlanFile(file);
      setPlan(loaded);
      lastSavedSnapshot.current = JSON.stringify(loaded);
      setLoadError(null);
      setView('overview');
    } catch (err) {
      const message = err instanceof PlanFileError ? err.message : 'Could not load that file.';
      setLoadError(message);
      if (plan) setDialog({ kind: 'alert', title: "Couldn't load file", message });
    }
  }

  return (
    <div className="app">
      <Header
        hasPlan={Boolean(plan)}
        activeView={view}
        onChangeView={setView}
        onNew={handleNew}
        onClose={handleClose}
        onSave={handleSave}
        onLoadFile={handleLoadFile}
      />
      <main className="app-main">
        {!plan ? (
          <EmptyState onNew={handleNew} onSample={handleSample} onLoadFile={handleLoadFile} error={loadError} />
        ) : (
          <>
            {view === 'overview' && <Overview plan={plan} />}
            {view === 'plan' && <PlanEditor plan={plan} onChange={updatePlan} />}
            {view === 'progress' && <ProgressTracker plan={plan} onChange={updatePlan} />}
            {view === 'gantt' && <GanttChart plan={plan} />}
          </>
        )}
      </main>
      {dialog?.kind === 'confirm' && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          tone="danger"
          onConfirm={() => {
            dialog.onConfirm();
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'alert' && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel="OK"
          cancelLabel={null}
          onConfirm={() => setDialog(null)}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}

export default App;
