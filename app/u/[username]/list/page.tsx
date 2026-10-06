import { ArrowLeft, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Poster } from "@/components/anime/poster";
import { getListStats, getUserByHandle, getUserList } from "@/lib/list";
import { KIND_LABELS, USER_STATUS_LABELS, USER_STATUSES, type UserListStatus } from "@/lib/shikimori/format";
import type { AnimeKind } from "@/lib/shikimori/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/u/[username]/list">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserByHandle(decodeURIComponent(username));
  return { title: profile ? `Список ${profile.name}` : "Пользователь не найден" };
}

const updated = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

export default async function UserListPage({ params, searchParams }: PageProps<"/u/[username]/list">) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const profile = await getUserByHandle(decodeURIComponent(username));
  if (!profile) notFound();

  const raw = Array.isArray(query.status) ? query.status[0] : query.status;
  const status = USER_STATUSES.includes(raw as UserListStatus) ? (raw as UserListStatus) : undefined;
  const [entries, stats] = await Promise.all([getUserList(profile.id, status), getListStats(profile.id)]);
  const handle = profile.username ?? profile.id;
  const base = `/u/${handle}/list`;

  const tabs = [
    { value: undefined, label: "Все", count: stats.total },
    ...USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s], count: stats.byStatus[s] ?? 0 })),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pt-10 md:px-6 md:pt-14">
      <div className="space-y-2">
        <Link href={`/u/${handle}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {profile.name}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Список аниме</h1>
      </div>

      <nav aria-label="Статусы" className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="inline-flex min-w-max items-center gap-1 rounded-full bg-card p-1">
          {tabs.map((tab) => {
            const active = tab.value === status;
            return (
              <li key={tab.label}>
                <Link
                  href={tab.value ? `${base}?status=${tab.value}` : base}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
                    active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  <span className="text-xs tabular-nums text-muted-foreground">{tab.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {entries.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/40">
          {entries.map((entry) => {
            const title = entry.animeRussian || entry.animeName;
            const total = entry.animeEpisodes;
            const progress = total ? Math.min(entry.episodes / total, 1) : 0;
            return (
              <li key={entry.id}>
                <Link href={`/anime/${entry.animeId}`} className="group flex items-center gap-4 p-3 transition-colors hover:bg-card">
                  <Poster src={entry.animePoster} alt={title} sizes="44px" compact className="aspect-[2/3] w-11 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-accent">{title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {[
                          entry.animeKind ? KIND_LABELS[entry.animeKind as AnimeKind] : null,
                          entry.animeYear,
                          status ? null : USER_STATUS_LABELS[entry.status],
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <span className="hidden sm:inline">обновлено {updated.format(entry.updatedAt)}</span>
                    </div>
                    {total ? (
                      <div className="flex max-w-xs items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-brand-accent" style={{ width: `${progress * 100}%` }} />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {entry.episodes}/{total}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <span className="flex w-12 shrink-0 items-center justify-end gap-1 text-sm font-medium tabular-nums text-foreground">
                    {entry.score ? (
                      <>
                        <Star className="size-3.5 fill-warning text-warning" /> {entry.score}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          В этом разделе пока пусто.
        </p>
      )}
    </div>
  );
}
