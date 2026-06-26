// Simple horizontal bar for rankings
export default function StatBar({ label, value, max, suffix = '', accent = 'bg-red-600' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300 truncate pr-2">{label}</span>
        <span className="text-zinc-400 tabular-nums flex-shrink-0">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${accent}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}