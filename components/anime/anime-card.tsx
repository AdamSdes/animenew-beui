import { Star } from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/motion/tilt-card";
import { animeTitle, animeYear, formatScore, KIND_LABELS, STATUS_LABELS } from "@/lib/shikimori/format";
import type { AnimeCard as AnimeCardData } from "@/lib/shikimori/types";
import { cn } from "@/lib/utils";
import { Poster } from "./poster";

export function ScoreBadge({ score, className }: { score: number | null; className?: string }) {
  const formatted = formatScore(score);
  if (!formatted) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground backdrop-blur-md",
        className,
      )}
    >
      <Star aria-hidden="true" className="size-3 fill-warning text-warning" />
      {formatted}
    </span>
  );
}

export function AnimeCard({
  anime,
  priority,
  className,
  sizes,
}: {
  anime: AnimeCardData;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const title = animeTitle(anime);
  const meta = [anime.kind ? KIND_LABELS[anime.kind] : null, animeYear(anime)].filter(Boolean).join(" · ");
  return (
    <Link href={`/anime/${anime.id}`} className={cn("group block outline-none", className)}>
      <TiltCard max={8} className="rounded-2xl border border-border bg-card">
        <Poster
          src={anime.poster?.mainUrl}
          alt={title}
          sizes={sizes}
          priority={priority}
          className="aspect-[2/3] w-full"
        />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <ScoreBadge score={anime.score} />
          {anime.status === "ongoing" || anime.status === "anons" ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-md",
                anime.status === "ongoing" ? "bg-success/90 text-black" : "bg-violet/90 text-white",
              )}
            >
              {STATUS_LABELS[anime.status]}
            </span>
          ) : null}
        </div>
      </TiltCard>
      <div className="mt-2.5 space-y-0.5 px-0.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </Link>
  );
}

export function AnimeGrid({ items, className }: { items: AnimeCardData[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((anime, i) => (
        <AnimeCard key={anime.id} anime={anime} priority={i < 6} />
      ))}
    </div>
  );
}

/** Horizontally scrolling row of cards for home-page shelves. */
export function AnimeRow({ items }: { items: AnimeCardData[] }) {
  return (
    <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
      {items.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} className="w-36 shrink-0 snap-start sm:w-44" sizes="176px" />
      ))}
    </div>
  );
}
