"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { useEffect, useRef } from "react";
import { Loader } from "@/components/motion/loader";
import { dedupeById } from "@/lib/shikimori/format";
import type { AnimeCard } from "@/lib/shikimori/types";
import { AnimeGrid } from "./anime-card";

async function fetchPage(query: string, page: number): Promise<AnimeCard[]> {
  const response = await fetch(`/api/catalog?${query}${query ? "&" : ""}page=${page}`);
  if (!response.ok) throw new Error("Не удалось загрузить каталог");
  return response.json();
}

export function CatalogResults({
  initial,
  query,
  pageSize,
}: {
  initial: AnimeCard[];
  /** Serialised filters, without the page. */
  query: string;
  pageSize: number;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useInfiniteQuery({
    queryKey: ["catalog", query],
    queryFn: ({ pageParam }) => fetchPage(query, pageParam),
    initialPageParam: 1,
    initialData: { pages: [initial], pageParams: [1] },
    getNextPageParam: (last, pages) => (last.length < pageSize ? undefined : pages.length + 1),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Shikimori pages can overlap when the ranking shifts between requests.
  const items = dedupeById(data.pages.flat());

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <p className="font-medium text-foreground">Ничего не нашлось</p>
        <p className="text-sm text-muted-foreground">Попробуйте изменить запрос или сбросить фильтры.</p>
      </div>
    );
  }

  return (
    <>
      <AnimeGrid items={items} className="lg:grid-cols-4 xl:grid-cols-5" />
      <div ref={sentinel} className="flex h-24 items-center justify-center">
        {isFetchingNextPage ? <Loader variant="dots" label="Загружаем ещё" /> : null}
        {isError ? <p className="text-sm text-muted-foreground">Не удалось загрузить продолжение.</p> : null}
        {!hasNextPage && items.length > pageSize ? (
          <p className="text-sm text-muted-foreground">Это всё по вашему запросу.</p>
        ) : null}
      </div>
    </>
  );
}
