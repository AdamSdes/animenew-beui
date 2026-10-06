import { pluralRu, USER_STATUS_LABELS, type UserListStatus } from "@/lib/shikimori/format";

export function ScoreBars({ stats }: { stats: { score: number; count: number }[] }) {
  const sorted = [...stats].sort((a, b) => b.score - a.score);
  const max = Math.max(...sorted.map((s) => s.count), 1);
  const total = sorted.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="space-y-1.5">
      {sorted.map((s) => (
        <div key={s.score} className="flex items-center gap-3 text-xs">
          <span className="w-4 text-right tabular-nums text-muted-foreground">{s.score}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand-accent" style={{ width: `${(s.count / max) * 100}%` }} />
          </div>
          <span className="w-14 text-right tabular-nums text-muted-foreground">{s.count.toLocaleString("ru-RU")}</span>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        {total.toLocaleString("ru-RU")} {pluralRu(total, "оценка", "оценки", "оценок")} на Shikimori
      </p>
    </div>
  );
}

export function StatusBars({ stats }: { stats: { status: string; count: number }[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0) || 1;
  const COLORS: Record<string, string> = {
    planned: "bg-violet",
    watching: "bg-accent",
    rewatching: "bg-accent",
    completed: "bg-success",
    on_hold: "bg-warning",
    dropped: "bg-destructive",
  };
  return (
    <div className="space-y-3">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {stats.map((s) => (
          <div key={s.status} className={COLORS[s.status] ?? "bg-muted-foreground"} style={{ width: `${(s.count / total) * 100}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {stats.map((s) => (
          <li key={s.status} className="flex items-center gap-2 text-muted-foreground">
            <span className={`size-2 rounded-full ${COLORS[s.status] ?? "bg-muted-foreground"}`} />
            <span className="flex-1">{USER_STATUS_LABELS[s.status as UserListStatus] ?? s.status}</span>
            <span className="tabular-nums">{s.count.toLocaleString("ru-RU")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
