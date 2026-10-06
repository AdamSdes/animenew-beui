import { CalendarClock, ExternalLink, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AnimeCard } from "@/components/anime/anime-card";
import { AnimeScreenshots } from "@/components/anime/anime-screenshots";
import { type AnimeTab, AnimeTabs } from "@/components/anime/anime-tabs";
import { Poster } from "@/components/anime/poster";
import { Comments } from "@/components/comments/comments";
import { ListControl } from "@/components/list/list-control";
import { ScoreBars, StatusBars } from "@/components/anime/stats-bars";
import { getAnime, getSimilar } from "@/lib/shikimori/api";
import { absoluteUrl } from "@/lib/shikimori/client";
import {
  animeTitle,
  formatDate,
  formatDuration,
  formatEpisodes,
  formatScore,
  formatSeason,
  KIND_LABELS,
  RATING_LABELS,
  STATUS_LABELS,
  stripBbCodes,
} from "@/lib/shikimori/format";
import type { AnimeDetails } from "@/lib/shikimori/types";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

// No paths at build time: every title is rendered on first visit, then cached (ISR).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/anime/[id]">): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnime(id).catch(() => null);
  if (!anime) return { title: "Аниме не найдено" };
  const title = animeTitle(anime);
  const description = stripBbCodes(anime.description).slice(0, 200) || `${title} — смотреть информацию, оценки и обсуждение.`;
  return {
    title,
    description,
    openGraph: { title, description, images: anime.poster ? [anime.poster.mainUrl] : undefined },
  };
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  if (children === null || children === undefined || children === "" || children === false) return null;
  return (
    <div className="flex gap-4 py-2 text-sm">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-foreground">{children}</dd>
    </div>
  );
}

function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card/40 p-5", className)}>
      {title ? <h2 className="mb-4 text-sm font-medium text-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

function shikiLink(url: string | null | undefined) {
  return absoluteUrl(url) ?? undefined;
}

function airingText(anime: AnimeDetails) {
  const aired = formatDate(anime.airedOn?.date);
  const released = formatDate(anime.releasedOn?.date);
  if (anime.status === "released" && aired && released && aired !== released) return `с ${aired} по ${released}`;
  if (anime.status === "anons") return aired ? `ожидается ${aired}` : "дата неизвестна";
  return aired;
}

function Characters({ anime }: { anime: AnimeDetails }) {
  const roles = [...(anime.characterRoles ?? [])].sort(
    (a, b) => Number(b.rolesEn.includes("Main")) - Number(a.rolesEn.includes("Main")),
  );
  return (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {roles.slice(0, 30).map((role) => {
        const name = role.character.russian || role.character.name;
        return (
          <li key={role.id}>
            <a href={shikiLink(role.character.url)} target="_blank" rel="noreferrer" className="group block">
              <Poster
                src={role.character.poster?.mainUrl}
                alt={name}
                sizes="140px"
                className="aspect-[3/4] w-full rounded-xl border border-border"
              />
              <p className="mt-2 line-clamp-2 text-xs font-medium text-foreground group-hover:text-accent">{name}</p>
              <p className="text-[11px] text-muted-foreground">
                {role.rolesEn.includes("Main") ? "Главная роль" : "Второстепенная"}
              </p>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function RelatedList({ anime }: { anime: AnimeDetails }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {(anime.related ?? []).map((rel) => {
        const entry = rel.anime ?? rel.manga;
        if (!entry) return null;
        const title = entry.russian || entry.name;
        const year = entry.airedOn?.year;
        const content = (
          <>
            <Poster
              src={entry.poster?.mainUrl}
              alt={title}
              sizes="56px"
              compact
              className="aspect-[2/3] w-14 shrink-0 rounded-lg border border-border"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{rel.relationText}</p>
              <p className="line-clamp-2 text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">
                {[rel.manga ? "Манга" : rel.anime?.kind ? KIND_LABELS[rel.anime.kind] : null, year].filter(Boolean).join(" · ")}
              </p>
            </div>
          </>
        );
        const className =
          "flex gap-3 rounded-xl border border-border bg-card/40 p-3 transition-colors hover:border-border-strong";
        return (
          <li key={rel.id}>
            {rel.anime ? (
              <Link href={`/anime/${rel.anime.id}`} className={className}>
                {content}
              </Link>
            ) : (
              <a href={shikiLink(rel.manga?.url)} target="_blank" rel="noreferrer" className={className}>
                {content}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Videos({ anime }: { anime: AnimeDetails }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {anime.videos.map((video) => (
        <li key={video.id}>
          <a href={video.url} target="_blank" rel="noreferrer" className="group block">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-card">
              {video.imageUrl ? (
                <Image
                  src={absoluteUrl(video.imageUrl) ?? video.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : null}
              <span className="absolute inset-0 grid place-items-center bg-black/20">
                <span className="grid size-12 place-items-center rounded-full bg-background/80 backdrop-blur-md">
                  <Play className="size-5 fill-foreground text-foreground" />
                </span>
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-sm text-foreground">{video.name || "Видео"}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function AnimePage({ params }: PageProps<"/anime/[id]">) {
  const { id } = await params;
  const [anime, similar] = await Promise.all([getAnime(id), getSimilar(id).catch(() => [])]);
  if (!anime) notFound();

  const title = animeTitle(anime);
  const description = stripBbCodes(anime.description);
  const score = formatScore(anime.score);
  const nextEpisode = anime.status === "ongoing" && anime.nextEpisodeAt ? new Date(anime.nextEpisodeAt) : null;

  const tabs: AnimeTab[] = [];
  if (anime.characterRoles?.length)
    tabs.push({ value: "characters", label: "Персонажи", count: anime.characterRoles.length, content: <Characters anime={anime} /> });
  if (anime.related?.length)
    tabs.push({ value: "related", label: "Связанное", count: anime.related.length, content: <RelatedList anime={anime} /> });
  if (similar.length)
    tabs.push({
      value: "similar",
      label: "Похожее",
      content: (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {similar.slice(0, 12).map((item) => (
            <AnimeCard key={item.id} anime={item} />
          ))}
        </div>
      ),
    });
  if (anime.videos.length)
    tabs.push({ value: "videos", label: "Видео", count: anime.videos.length, content: <Videos anime={anime} /> });
  if (anime.screenshots.length)
    tabs.push({
      value: "screenshots",
      label: "Кадры",
      count: anime.screenshots.length,
      content: <AnimeScreenshots screenshots={anime.screenshots} title={title} />,
    });

  return (
    <article className="relative">
      {/* Blurred poster backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-14 h-[520px] overflow-hidden">
        {anime.poster ? (
          <Image src={anime.poster.mainUrl} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-3xl" />
        ) : (
          <div className="poster-placeholder absolute inset-0 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
        <div className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-12">
          <div className="mx-auto w-full max-w-[280px] space-y-4 md:mx-0">
            <Poster
              src={anime.poster?.main2xUrl ?? anime.poster?.mainUrl}
              alt={title}
              sizes="280px"
              priority
              className="aspect-[2/3] w-full rounded-2xl border border-border shadow-2xl shadow-black/40"
            />
            <ListControl animeId={anime.id} totalEpisodes={anime.episodes || anime.episodesAired} />
            {anime.url ? (
              <a
                href={shikiLink(anime.url)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Открыть на Shikimori <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>

          <div className="min-w-0 space-y-6">
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {anime.kind ? (
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">{KIND_LABELS[anime.kind]}</span>
                ) : null}
                {anime.status ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-medium",
                      anime.status === "ongoing" && "bg-success/15 text-success",
                      anime.status === "anons" && "bg-violet/15 text-violet",
                      anime.status === "released" && "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    {STATUS_LABELS[anime.status]}
                  </span>
                ) : null}
                {anime.airedOn?.year ? (
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
                    {formatSeason(anime.season) ?? anime.airedOn.year}
                  </span>
                ) : null}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {[anime.name !== title ? anime.name : null, anime.japanese].filter(Boolean).join(" · ")}
              </p>
            </header>

            <div className="flex flex-wrap items-center gap-6">
              {score ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">{score}</span>
                  <div className="text-xs leading-tight text-muted-foreground">
                    оценка
                    <br />
                    на Shikimori
                  </div>
                </div>
              ) : null}
              {nextEpisode ? (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm">
                  <CalendarClock className="size-4 text-accent" />
                  <span className="text-muted-foreground">{anime.episodesAired + 1} эпизод:</span>
                  <time dateTime={nextEpisode.toISOString()} className="text-foreground">
                    {nextEpisode.toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Moscow",
                    })}{" "}
                    МСК
                  </time>
                </div>
              ) : null}
            </div>

            {anime.genres?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/catalog?genre=${genre.id}`}
                    className="press rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {genre.russian}
                  </Link>
                ))}
              </div>
            ) : null}

            {description ? (
              <div className="prose-anime max-w-3xl text-[15px]">
                {description.split(/\n{2,}|\n/).map((paragraph, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static paragraphs
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Описание пока не добавлено.</p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Информация">
                <dl className="divide-y divide-border">
                  <InfoRow label="Тип">{anime.kind ? KIND_LABELS[anime.kind] : null}</InfoRow>
                  <InfoRow label="Эпизоды">{formatEpisodes(anime)}</InfoRow>
                  <InfoRow label="Длительность">
                    {formatDuration(anime.duration) && (anime.kind === "movie" ? formatDuration(anime.duration) : `${formatDuration(anime.duration)} эп.`)}
                  </InfoRow>
                  <InfoRow label="Статус">{anime.status ? STATUS_LABELS[anime.status] : null}</InfoRow>
                  <InfoRow label="Выход">{airingText(anime)}</InfoRow>
                  <InfoRow label="Рейтинг">{anime.rating && anime.rating !== "none" ? RATING_LABELS[anime.rating] : null}</InfoRow>
                  <InfoRow label="Студия">{anime.studios.map((s) => s.name).join(", ")}</InfoRow>
                  <InfoRow label="Лицензия в РФ">{anime.licenseNameRu}</InfoRow>
                  <InfoRow label="Озвучка">{anime.fandubbers.slice(0, 8).join(", ")}</InfoRow>
                  <InfoRow label="Субтитры">{anime.fansubbers.slice(0, 6).join(", ")}</InfoRow>
                </dl>
              </Panel>
              <div className="space-y-4">
                {anime.scoresStats?.length ? (
                  <Panel title="Оценки пользователей">
                    <ScoreBars stats={anime.scoresStats} />
                  </Panel>
                ) : null}
                {anime.statusesStats?.length ? (
                  <Panel title="В списках">
                    <StatusBars stats={anime.statusesStats} />
                  </Panel>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {tabs.length ? (
          <div className="mt-12">
            <AnimeTabs tabs={tabs} />
          </div>
        ) : null}

        <div className="mt-16 max-w-3xl">
          <Comments animeId={anime.id} />
        </div>
      </div>
    </article>
  );
}
