import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Poster } from "@/components/anime/poster";
import { StatusBars } from "@/components/anime/stats-bars";
import { ActivityHeatmap } from "@/components/profile/activity-heatmap";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatTile } from "@/components/profile/stat-tile";
import { getSession } from "@/lib/auth";
import { getActivity, getListStats, getRecentEvents, getUserByHandle, getUserList } from "@/lib/list";
import { USER_STATUS_LABELS, USER_STATUSES } from "@/lib/shikimori/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserByHandle(decodeURIComponent(username));
  return { title: profile ? `${profile.name} — профиль` : "Пользователь не найден" };
}

const eventTime = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getUserByHandle(decodeURIComponent(username));
  if (!profile) notFound();

  const [session, stats, activity, events, watching] = await Promise.all([
    getSession(),
    getListStats(profile.id),
    getActivity(profile.id),
    getRecentEvents(profile.id),
    getUserList(profile.id, "watching"),
  ]);
  const isOwner = session?.user.id === profile.id;
  const handle = profile.username ?? profile.id;
  const days = Object.fromEntries(activity.map((a) => [a.day, a.count]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 pt-10 md:px-6 md:pt-14">
      <ProfileHeader profile={profile} isOwner={isOwner} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Тайтлов в списке" value={stats.total} />
        <StatTile label="Просмотрено" value={stats.byStatus.completed ?? 0} />
        <StatTile label="Эпизодов посмотрено" value={stats.episodes} />
        <StatTile label="Средняя оценка" value={stats.meanScore ?? 0} decimals={1} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4 rounded-2xl border border-border bg-card/40 p-5">
          <h2 className="text-sm font-medium text-foreground">Активность за полгода</h2>
          <ActivityHeatmap days={days} endDate={today} />
        </section>
        <section className="space-y-4 rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Список</h2>
            <Link href={`/u/${handle}/list`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Открыть <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {stats.total ? (
            <StatusBars
              stats={USER_STATUSES.filter((s) => stats.byStatus[s]).map((status) => ({ status, count: stats.byStatus[status] ?? 0 }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Список пока пуст.</p>
          )}
        </section>
      </div>

      {watching.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Смотрит сейчас</h2>
          <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 md:-mx-6 md:px-6">
            {watching.map((entry) => {
              const title = entry.animeRussian || entry.animeName;
              return (
                <Link key={entry.id} href={`/anime/${entry.animeId}`} className="group w-32 shrink-0 sm:w-36">
                  <Poster src={entry.animePoster} alt={title} sizes="144px" className="aspect-[2/3] w-full rounded-2xl border border-border" />
                  <p className="mt-2 line-clamp-2 text-sm text-foreground group-hover:text-accent">{title}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {entry.episodes} / {entry.animeEpisodes || "?"} эп.
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Последние действия</h2>
        {events.length ? (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card/40">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <Link href={`/anime/${event.animeId}`} className="font-medium text-foreground hover:text-accent">
                  {event.animeTitle}
                </Link>
                <span className="text-muted-foreground">
                  {[
                    event.status ? USER_STATUS_LABELS[event.status] : null,
                    event.score ? `оценка ${event.score}` : null,
                    event.episodes && event.status !== "completed" ? `${event.episodes} эп.` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <time dateTime={event.createdAt.toISOString()} className="ml-auto text-xs text-muted-foreground">
                  {eventTime.format(event.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOwner ? "Добавьте первое аниме в список — активность появится здесь." : "Пока ничего."}
          </p>
        )}
      </section>
    </div>
  );
}
