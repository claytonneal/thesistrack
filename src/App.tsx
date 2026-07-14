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
import './App.css';

function App() {
  const [plan, setPlan] = useState<ThesisPlan | null>(() => loadFromLocalStorage());
  const [view, setView] = useState<ViewId>('overview');
  const [loadError, setLoadError] = useState<string | null>(null);
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
    if (plan) {
      const dirty = JSON.stringify(plan) !== lastSavedSnapshot.current;
      const proceed = dirty
        ? window.confirm('Starting a new plan will replace your current one. Save it to a file first?\n\nPress Cancel to go back and save, or OK to discard and start fresh.')
        : true;
      if (!proceed) return;
    }
    const fresh = createEmptyPlan();
    setPlan(fresh);
    lastSavedSnapshot.current = null;
    setLoadError(null);
    setView('plan');
  }

  function handleClose() {
    if (plan) {
      const dirty = JSON.stringify(plan) !== lastSavedSnapshot.current;
      const proceed = dirty
        ? window.confirm('Close this plan? Save it to a file first if you want a portable copy.\n\nPress Cancel to go back and save, or OK to close.')
        : true;
      if (!proceed) return;
    }
    setPlan(null);
    lastSavedSnapshot.current = null;
    setLoadError(null);
    setView('overview');
    clearLocalStorage();
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
      if (plan) window.alert(message);
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
    </div>
  );
}

export default App;
