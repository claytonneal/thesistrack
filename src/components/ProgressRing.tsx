export function ProgressRing({ percent, size = 108 }: { percent: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const isComplete = clamped >= 100;

  return (
    <div className="progress-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--paper-deep-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'var(--forest)' : 'var(--rust)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="progress-ring-value"
          fill="var(--ink)"
        >
          {clamped}%
        </text>
      </svg>
      <span className="label">Complete</span>
    </div>
  );
}
