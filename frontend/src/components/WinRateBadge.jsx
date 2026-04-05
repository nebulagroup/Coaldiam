import { getScoreColor } from '../lib/utils';

export default function WinRateBadge({ rate = 0 }) {
  const color = getScoreColor(rate);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 50, height: 50 }}>
      <svg width="50" height="50" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="25" cy="25" r="18"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="25" cy="25" r="18"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>
          {Math.round(rate)}%
        </span>
      </div>
    </div>
  );
}
