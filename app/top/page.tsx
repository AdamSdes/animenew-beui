import type { Metadata } from "next";
import Link from "next/link";
import { Poster } from "@/components/anime/poster";
import { PageHeader } from "@/components/site/section";
import { searchAnimes, softDuringBuild } from "@/lib/shikimori/api";
import { animeTitle, animeYear, dedupeById, formatEpisodes, formatScore, KIND_LABELS } from "@/lib/shikimori/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Топ-100 аниме",
  description: "Лучшие аниме по оценкам пользователей Shikimori.",
};

export const revalidate = 21600;

export default async function TopPage() {
  const pages = await Promise.all(
    [1, 2].map((page) => softDuringBuild(searchAnimes({ order: "ranked", limit: 50, page, kind: "tv,movie,ova,ona" }), [])),
  );
  const items = dedupeById(pages.flat()).slice(0, 100);

  return (
    <>
      <PageHeader title="Топ-100" description="Лучшие тайтлы по оценкам пользователей Shikimori." />
      <ol className="mx-auto max-w-4xl space-y-2 px-4 md:px-6">
        {items.map((anime, i) => {
          const title = animeTitle(anime);
          const rank = i + 1;
          return (
            <li key={anime.id}>
              <Link
                href={`/anime/${anime.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition-colors hover:border-border hover:bg-card/40"
              >
                <span
                  className={cn(
                    "w-10 shrink-0 text-center text-xl font-semibold tabular-nums",
                    rank <= 3 ? "text-gradient-accent" : "text-muted-foreground",
                  )}
                >
                  {rank}
                </span>
                <Poster src={anime.poster?.mainUrl} alt={title} sizes="48px" compact className="aspect-[2/3] w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground group-hover:text-accent">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[anime.kind ? KIND_LABELS[anime.kind] : null, animeYear(anime), formatEpisodes(anime)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground">{formatScore(anime.score)}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
