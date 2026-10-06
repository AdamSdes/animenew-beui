"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clapperboard, Compass, Flame, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { type CommandItem, CommandPalette } from "@/components/motion/command-palette";
import { animeTitle, animeYear, formatScore, KIND_LABELS } from "@/lib/shikimori/format";
import type { AnimeCard } from "@/lib/shikimori/types";

const NAVIGATION = [
  { id: "nav-catalog", label: "Каталог", href: "/catalog", icon: Compass, keywords: ["поиск", "фильтры"] },
  { id: "nav-ongoing", label: "Онгоинги", href: "/catalog?status=ongoing", icon: Flame, keywords: ["выходит"] },
  { id: "nav-calendar", label: "Календарь выхода серий", href: "/calendar", icon: CalendarDays, keywords: ["расписание"] },
  { id: "nav-top", label: "Топ аниме", href: "/top", icon: Trophy, keywords: ["лучшее", "рейтинг"] },
];

async function fetchSearch(query: string): Promise<AnimeCard[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("search failed");
  return response.json();
}

export function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());

  const { data, isFetching } = useQuery({
    queryKey: ["search", deferred],
    queryFn: () => fetchSearch(deferred),
    enabled: deferred.length >= 2,
    placeholderData: (previous) => previous,
  });

  const items = useMemo<CommandItem[]>(() => {
    const anime: CommandItem[] =
      deferred.length >= 2
        ? (data ?? []).map((a) => ({
            id: `anime-${a.id}`,
            label: animeTitle(a),
            group: "Аниме",
            icon: Clapperboard,
            badge: (
              <span className="text-xs text-muted-foreground tabular-nums">
                {[a.kind ? KIND_LABELS[a.kind] : null, animeYear(a), formatScore(a.score) && `★ ${formatScore(a.score)}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ),
            onSelect: () => router.push(`/anime/${a.id}`),
          }))
        : [];
    const lower = deferred.toLowerCase();
    const nav = NAVIGATION.filter(
      (n) => !lower || n.label.toLowerCase().includes(lower) || n.keywords.some((k) => k.includes(lower)),
    ).map((n) => ({
      id: n.id,
      label: n.label,
      group: "Разделы",
      icon: n.icon,
      onSelect: () => router.push(n.href),
    }));
    const searchAll: CommandItem[] =
      deferred.length >= 2
        ? [
            {
              id: "search-all",
              label: `Искать «${deferred}» в каталоге`,
              group: "Разделы",
              icon: Compass,
              onSelect: () => router.push(`/catalog?q=${encodeURIComponent(deferred)}`),
            },
          ]
        : [];
    return [...anime, ...searchAll, ...nav];
  }, [data, deferred, router]);

  return (
    <CommandPalette
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      onQueryChange={setQuery}
      shouldFilter={false}
      placeholder="Найти аниме, раздел…"
      emptyMessage={isFetching ? "Ищем…" : "Ничего не нашлось."}
      labels={{ dialog: "Поиск", close: "Закрыть поиск", list: "Результаты поиска" }}
    />
  );
}
