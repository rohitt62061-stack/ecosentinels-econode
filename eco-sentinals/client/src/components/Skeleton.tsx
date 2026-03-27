export function SkeletonCard({ lines = 3, height = 'h-4' }) {
  return (
    <div className="animate-pulse space-y-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg2)]">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${height} bg-[var(--bg3)] rounded ${i===0?'w-3/4':'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 p-3 rounded border border-[var(--border)]">
          <div className="h-4 w-8 bg-[var(--bg3)] rounded" />
          <div className="h-4 flex-1 bg-[var(--bg3)] rounded" />
          <div className="h-4 w-20 bg-[var(--bg3)] rounded" />
          <div className="h-4 w-16 bg-[var(--bg3)] rounded" />
        </div>
      ))}
    </div>
  );
}
