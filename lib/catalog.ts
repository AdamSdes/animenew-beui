// URL <-> filter mapping for the catalog. Shared by the page, the API route and
// the client filters, so all three agree on what a URL means.

import { ANIME_KINDS, ANIME_ORDERS, ANIME_STATUSES, type AnimeOrder, type AnimeSearchParams } from "./shikimori/types";

export type CatalogFilters = {
  q: string;
  order: AnimeOrder;
  kinds: string[];
  statuses: string[];
  genres: string[];
  season: string;
  score: number;
};

export const DEFAULT_ORDER: AnimeOrder = "popularity";

const currentYear = new Date().getFullYear();

export const SEASON_OPTIONS: { value: string; label: string }[] = [
  ...Array.from({ length: 6 }, (_, i) => String(currentYear + 1 - i)).map((y) => ({ value: y, label: y })),
  { value: `2020_${currentYear - 5}`, label: `2020–${currentYear - 5}` },
  { value: "2010_2019", label: "2010–2019" },
  { value: "2000_2009", label: "2000–2009" },
  { value: "1990_1999", label: "1990–1999" },
  { value: "1980_1989", label: "1980–1989" },
  { value: "1900_1979", label: "до 1980" },
];

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: RawParams, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key) ?? "";
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function list(value: string, allowed?: readonly string[]) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v && (!allowed || allowed.includes(v)));
}

export function parseCatalogFilters(params: RawParams): CatalogFilters {
  const order = read(params, "order") as AnimeOrder;
  const score = Number(read(params, "score"));
  const season = read(params, "season");
  return {
    q: read(params, "q").slice(0, 100),
    order: ANIME_ORDERS.includes(order) ? order : DEFAULT_ORDER,
    kinds: list(read(params, "kind"), ANIME_KINDS),
    statuses: list(read(params, "status"), ANIME_STATUSES),
    genres: list(read(params, "genre")).filter((g) => /^\d+$/.test(g)),
    season: /^[\dx_]+$/.test(season) ? season : "",
    score: Number.isInteger(score) && score >= 1 && score <= 9 ? score : 0,
  };
}

export function filtersToSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.order !== DEFAULT_ORDER) params.set("order", filters.order);
  if (filters.kinds.length) params.set("kind", filters.kinds.join(","));
  if (filters.statuses.length) params.set("status", filters.statuses.join(","));
  if (filters.genres.length) params.set("genre", filters.genres.join(","));
  if (filters.season) params.set("season", filters.season);
  if (filters.score) params.set("score", String(filters.score));
  return params;
}

export function filtersToApi(filters: CatalogFilters, page = 1): AnimeSearchParams {
  return {
    search: filters.q || undefined,
    order: filters.order,
    kind: filters.kinds.join(",") || undefined,
    status: filters.statuses.join(",") || undefined,
    genre: filters.genres.join(",") || undefined,
    season: filters.season || undefined,
    score: filters.score || undefined,
    page,
  };
}

export function activeFilterCount(filters: CatalogFilters) {
  return (
    filters.kinds.length + filters.statuses.length + filters.genres.length + (filters.season ? 1 : 0) + (filters.score ? 1 : 0)
  );
}
