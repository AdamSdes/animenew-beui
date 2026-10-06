"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Input } from "@/components/motion/input";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectLabel,
  MultiSelectList,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/motion/multi-select";
import { RangeSlider } from "@/components/motion/range-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import {
  activeFilterCount,
  type CatalogFilters as Filters,
  filtersToSearchParams,
  SEASON_OPTIONS,
} from "@/lib/catalog";
import { KIND_LABELS, ORDER_LABELS, STATUS_LABELS } from "@/lib/shikimori/format";
import { ANIME_ORDERS, type AnimeKind, type AnimeOrder, type Genre } from "@/lib/shikimori/types";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: AnimeKind[] = ["tv", "movie", "ova", "ona", "special", "tv_special", "music"];
const GENRE_GROUPS = [
  { kind: "genre", label: "Жанры" },
  { kind: "theme", label: "Темы" },
  { kind: "demographic", label: "Аудитория" },
] as const;
const ANY = "any";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "press h-8 rounded-full border px-3 text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterPanel({
  filters,
  genres,
  onChange,
}: {
  filters: Filters;
  genres: Genre[];
  onChange: (next: Partial<Filters>) => void;
}) {
  return (
    <div className="space-y-6">
      <FilterGroup title="Тип">
        <div className="flex flex-wrap gap-1.5">
          {KIND_OPTIONS.map((kind) => (
            <Chip
              key={kind}
              active={filters.kinds.includes(kind)}
              onClick={() => onChange({ kinds: toggle(filters.kinds, kind) })}
            >
              {KIND_LABELS[kind]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Статус">
        <div className="flex flex-wrap gap-1.5">
          {(["ongoing", "released", "anons"] as const).map((status) => (
            <Chip
              key={status}
              active={filters.statuses.includes(status)}
              onClick={() => onChange({ statuses: toggle(filters.statuses, status) })}
            >
              {STATUS_LABELS[status]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Жанры и темы">
        <MultiSelect value={filters.genres} onValueChange={(genres) => onChange({ genres })}>
          <MultiSelectTrigger>
            <MultiSelectValue placeholder={null} />
            <MultiSelectInput aria-label="Найти жанр" placeholder="Любые — начните вводить" />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectList ariaLabel="Жанры">
              {GENRE_GROUPS.map((group) => (
                <MultiSelectGroup key={group.kind}>
                  <MultiSelectLabel>{group.label}</MultiSelectLabel>
                  {genres
                    .filter((g) => g.kind === group.kind)
                    .sort((a, b) => a.russian.localeCompare(b.russian, "ru"))
                    .map((genre) => (
                      <MultiSelectItem key={genre.id} value={genre.id} textValue={genre.russian}>
                        {genre.russian}
                      </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
              ))}
              <MultiSelectEmpty>Ничего не найдено.</MultiSelectEmpty>
            </MultiSelectList>
          </MultiSelectContent>
        </MultiSelect>
      </FilterGroup>

      <FilterGroup title="Год выхода">
        <Select value={filters.season || ANY} onValueChange={(v) => onChange({ season: v === ANY ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="Любой" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Любой</SelectItem>
            {SEASON_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title={filters.score ? `Оценка от ${filters.score}` : "Оценка — любая"}>
        <RangeSlider
          min={0}
          max={9}
          step={1}
          value={filters.score}
          onValueChange={(score) => onChange({ score })}
          aria-label="Минимальная оценка"
          formatValueText={(v) => (v ? `от ${v}` : "любая")}
        />
      </FilterGroup>
    </div>
  );
}

/** Writes filter changes to the URL; the server page re-renders with the new results. */
function useApplyFilters(filters: Filters) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const apply = (patch: Partial<Filters>) => {
    const qs = filtersToSearchParams({ ...filtersRef.current, ...patch }).toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { apply, pending };
}

const CLEARED: Partial<Filters> = { kinds: [], statuses: [], genres: [], season: "", score: 0 };

export function CatalogFilters({ filters, genres }: { filters: Filters; genres: Genre[] }) {
  const { apply, pending } = useApplyFilters(filters);
  const [query, setQuery] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastSentQuery = useRef(filters.q);

  // Follow external URL changes (e.g. "search in catalog" from the palette),
  // but not the echo of our own debounced update while the user keeps typing.
  useEffect(() => {
    if (filters.q !== lastSentQuery.current) {
      lastSentQuery.current = filters.q;
      setQuery(filters.q);
    }
  }, [filters.q]);

  // Debounced search-as-you-type.
  // biome-ignore lint/correctness/useExhaustiveDependencies: apply reads the latest filters through a ref
  useEffect(() => {
    if (query.trim() === filters.q) return;
    const id = window.setTimeout(() => {
      lastSentQuery.current = query.trim();
      apply({ q: query.trim() });
    }, 400);
    return () => window.clearTimeout(id);
  }, [query]);

  const count = activeFilterCount(filters);
  const reset = () => {
    setQuery("");
    lastSentQuery.current = "";
    apply({ ...CLEARED, q: "" });
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            value={query}
            onChange={setQuery}
            placeholder="Название аниме"
            aria-label="Поиск по названию"
            leftIcon={<Search className="size-4" />}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-full sm:w-56">
            <Select value={filters.order} onValueChange={(order) => apply({ order: order as AnimeOrder })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIME_ORDERS.map((order) => (
                  <SelectItem key={order} value={order}>
                    {ORDER_LABELS[order]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="press inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground lg:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Фильтры
            {count ? (
              <span className="grid size-5 place-items-center rounded-full bg-foreground text-[11px] text-background">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div
        aria-hidden={!pending}
        className={cn(
          "pointer-events-none fixed inset-x-0 top-14 z-30 h-0.5 origin-left bg-brand-accent transition-opacity",
          pending ? "animate-pulse opacity-100" : "opacity-0",
        )}
      />

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[0.85]}
        title="Фильтры"
        description={count ? `Выбрано: ${count}` : undefined}
      >
        <div className="space-y-6 pb-10">
          <FilterPanel filters={filters} genres={genres} onChange={apply} />
          {count ? (
            <button type="button" onClick={reset} className="text-sm text-muted-foreground underline underline-offset-4">
              Сбросить фильтры
            </button>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
}

/** Desktop sidebar version of the same panel. */
export function CatalogSidebar({ filters, genres }: { filters: Filters; genres: Genre[] }) {
  const { apply } = useApplyFilters(filters);
  const count = activeFilterCount(filters);

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-20 space-y-6 rounded-2xl border border-border bg-card/40 p-5">
        <FilterPanel filters={filters} genres={genres} onChange={apply} />
        {count ? (
          <button
            type="button"
            onClick={() => apply(CLEARED)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> Сбросить ({count})
          </button>
        ) : null}
      </div>
    </aside>
  );
}
