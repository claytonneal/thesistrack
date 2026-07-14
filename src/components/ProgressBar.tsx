export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="progress-bar">
      <div
        className={`progress-bar-fill${clamped >= 100 ? ' is-complete' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
