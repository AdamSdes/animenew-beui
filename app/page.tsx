import { CalendarDays, Search } from "lucide-react";
import { AnimeGrid, AnimeRow } from "@/components/anime/anime-card";
import { HeroCarousel } from "@/components/anime/hero-carousel";
import { Marquee } from "@/components/motion/marquee";
import { TextReveal } from "@/components/motion/text-reveal";
import { LinkButton, PressLink } from "@/components/site/press-link";
import { Section } from "@/components/site/section";
import { getGenres, searchAnimes, softDuringBuild } from "@/lib/shikimori/api";
import { dedupeById, pluralRu } from "@/lib/shikimori/format";

export const revalidate = 1800;

export default async function HomePage() {
  const [ongoing, popular, anons, top, genres] = await Promise.all([
    softDuringBuild(searchAnimes({ status: "ongoing", order: "popularity", limit: 18 }), []),
    softDuringBuild(searchAnimes({ order: "popularity", limit: 18, status: "released,ongoing" }), []),
    softDuringBuild(searchAnimes({ status: "anons", order: "popularity", limit: 12 }), []),
    softDuringBuild(searchAnimes({ order: "ranked", limit: 12, kind: "tv,movie" }), []),
    softDuringBuild(getGenres(), []),
  ]);

  const heroItems = dedupeById([...ongoing, ...popular]).slice(0, 12);

  return (
    <div className="space-y-16 pb-8 md:space-y-20">
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="grid-noise mask-radial-fade absolute inset-0 opacity-60" />
        <div
          aria-hidden="true"
          className="absolute -top-48 left-1/2 h-[520px] w-[960px] -translate-x-1/2 rounded-full bg-brand-accent opacity-[0.12] blur-3xl"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-14 pb-4 text-center md:pt-20">
          {ongoing.length ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> Сейчас выходит {ongoing.length}+{" "}
              {pluralRu(ongoing.length, "онгоинг", "онгоинга", "онгоингов")}
            </p>
          ) : null}
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            <TextReveal text="Находи аниме," split="word" />
            <TextReveal text="отмечай и обсуждай" split="word" delay={0.2} className="text-muted-foreground" />
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Каталог с фильтрами, календарь выхода серий, личные списки и комментарии — всё в одном месте.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/catalog" size="lg">
              <Search aria-hidden="true" className="size-4" /> Открыть каталог
            </LinkButton>
            <LinkButton href="/calendar" size="lg" variant="secondary">
              <CalendarDays aria-hidden="true" className="size-4" /> Календарь
            </LinkButton>
          </div>
        </div>
        <div className="relative mt-10 hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:block">
          <HeroCarousel items={heroItems} />
        </div>
      </section>

      <Section title="Сейчас выходит" description="Онгоинги этого сезона" href="/catalog?status=ongoing">
        <AnimeRow items={ongoing} />
      </Section>

      <Section title="Популярное" href="/catalog">
        <AnimeGrid items={popular.slice(0, 12)} />
      </Section>

      <Section title="Жанры" className="overflow-hidden">
        <Marquee pauseOnHover fade speed={40} gap="0.75rem">
          {genres
            .filter((g) => g.kind === "genre")
            .map((genre) => (
              <PressLink
                key={genre.id}
                href={`/catalog?genre=${genre.id}`}
                className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                {genre.russian}
              </PressLink>
            ))}
        </Marquee>
      </Section>

      {anons.length ? (
        <Section title="Скоро" description="Анонсированные тайтлы" href="/catalog?status=anons">
          <AnimeRow items={anons} />
        </Section>
      ) : null}

      <Section title="Лучшие за всё время" href="/top">
        <AnimeGrid items={top.slice(0, 12)} />
      </Section>
    </div>
  );
}
