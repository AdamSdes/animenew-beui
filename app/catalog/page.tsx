import type { Metadata } from "next";
import { CatalogFilters, CatalogSidebar } from "@/components/anime/catalog-filters";
import { CatalogResults } from "@/components/anime/catalog-results";
import { PageHeader } from "@/components/site/section";
import { filtersToApi, filtersToSearchParams, parseCatalogFilters } from "@/lib/catalog";
import { getGenres, PAGE_SIZE, searchAnimes } from "@/lib/shikimori/api";

export const metadata: Metadata = {
  title: "Каталог аниме",
  description: "Поиск аниме по жанрам, году, типу и рейтингу.",
};

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const filters = parseCatalogFilters(await searchParams);
  const query = filtersToSearchParams(filters).toString();
  const [initial, genres] = await Promise.all([
    searchAnimes({ ...filtersToApi(filters), limit: PAGE_SIZE }),
    getGenres(),
  ]);

  return (
    <>
      <PageHeader title="Каталог" description="Тысячи тайтлов с Shikimori: ищите по названию, жанрам, году и оценке." />
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 md:px-6">
        <CatalogSidebar filters={filters} genres={genres} />
        <div className="min-w-0 flex-1 space-y-6">
          <CatalogFilters filters={filters} genres={genres} />
          <CatalogResults key={query} initial={initial} query={query} pageSize={PAGE_SIZE} />
        </div>
      </div>
    </>
  );
}
