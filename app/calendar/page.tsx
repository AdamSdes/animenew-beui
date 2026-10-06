import type { Metadata } from "next";
import Link from "next/link";
import { Poster } from "@/components/anime/poster";
import { PageHeader } from "@/components/site/section";
import { getCalendar, softDuringBuild } from "@/lib/shikimori/api";
import { animeTitle, formatScore, KIND_LABELS, pluralRu } from "@/lib/shikimori/format";
import type { CalendarEntry } from "@/lib/shikimori/types";

export const metadata: Metadata = {
  title: "Календарь онгоингов",
  description: "Расписание выхода новых серий аниме на ближайшую неделю.",
};

export const revalidate = 1800;

const TZ = "Europe/Moscow";
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabelFormat = new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const timeFormat = new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

function dayLabel(key: string, todayKey: string, tomorrowKey: string, date: Date) {
  const label = dayLabelFormat.format(date);
  if (key === todayKey) return { title: "Сегодня", subtitle: label };
  if (key === tomorrowKey) return { title: "Завтра", subtitle: label };
  const [weekday, ...rest] = label.split(", ");
  return { title: weekday.charAt(0).toUpperCase() + weekday.slice(1), subtitle: rest.join(", ") };
}

function Entry({ entry }: { entry: CalendarEntry }) {
  const title = animeTitle(entry.anime);
  const total = entry.anime.episodes;
  return (
    <Link
      href={`/anime/${entry.anime.id}`}
      className="group flex gap-3 rounded-2xl border border-border bg-card/40 p-2.5 transition-colors hover:border-border-strong"
    >
      <Poster src={entry.anime.poster?.mainUrl} alt={title} sizes="64px" compact className="aspect-[2/3] w-16 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-accent">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {[entry.anime.kind ? KIND_LABELS[entry.anime.kind] : null, formatScore(entry.anime.score) && `★ ${formatScore(entry.anime.score)}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
            {entry.nextEpisode} эп.{total ? ` из ${total}` : ""}
          </span>
          <time dateTime={entry.nextEpisodeAt} className="font-medium tabular-nums text-foreground">
            {timeFormat.format(new Date(entry.nextEpisodeAt))}
          </time>
        </div>
      </div>
    </Link>
  );
}

export default async function CalendarPage() {
  const entries = await softDuringBuild(getCalendar(), []);
  const now = new Date();
  const todayKey = dayKeyFormat.format(now);
  const tomorrowKey = dayKeyFormat.format(new Date(now.getTime() + 86_400_000));

  const days = new Map<string, { date: Date; entries: CalendarEntry[] }>();
  for (const entry of entries) {
    const date = new Date(entry.nextEpisodeAt);
    const key = dayKeyFormat.format(date);
    if (key < todayKey) continue;
    const day = days.get(key) ?? { date, entries: [] };
    day.entries.push(entry);
    days.set(key, day);
  }
  const sorted = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 8);

  return (
    <>
      <PageHeader title="Календарь" description="Когда выйдут новые серии онгоингов. Время указано по Москве." />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-6">
        {sorted.length ? (
          sorted.map(([key, day]) => {
            const label = dayLabel(key, todayKey, tomorrowKey, day.date);
            return (
              <section key={key} aria-labelledby={`day-${key}`}>
                <div className="sticky top-14 z-10 -mx-4 mb-4 flex items-baseline gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
                  <h2 id={`day-${key}`} className="text-lg font-semibold text-foreground">
                    {label.title}
                  </h2>
                  <span className="text-sm text-muted-foreground">{label.subtitle}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{day.entries.length} {pluralRu(day.entries.length, "тайтл", "тайтла", "тайтлов")}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {day.entries
                    .sort((a, b) => a.nextEpisodeAt.localeCompare(b.nextEpisodeAt))
                    .map((entry) => (
                      <Entry key={`${entry.anime.id}-${entry.nextEpisode}`} entry={entry} />
                    ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="text-muted-foreground">Расписание пока пустое.</p>
        )}
      </div>
    </>
  );
}
