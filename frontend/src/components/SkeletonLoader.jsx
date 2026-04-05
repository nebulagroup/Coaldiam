export default function SkeletonLoader({ type = 'card', rows = 5 }) {
  if (type === 'table') {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 w-12 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-12 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="skeleton h-12 rounded" />
          <div className="skeleton h-12 rounded" />
          <div className="skeleton h-12 rounded" />
        </div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        <div className="skeleton h-[420px] rounded-none" />
      </div>
    );
  }

  return null;
}
