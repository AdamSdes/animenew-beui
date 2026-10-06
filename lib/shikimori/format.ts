// Russian labels and formatting helpers. Safe to import from client components.

import type { AnimeCard, AnimeKind, AnimeOrder, AnimeRating, AnimeStatus } from "./types";

export const KIND_LABELS: Record<AnimeKind, string> = {
  tv: "TV Сериал",
  movie: "Фильм",
  ova: "OVA",
  ona: "ONA",
  special: "Спецвыпуск",
  tv_special: "TV Спецвыпуск",
  music: "Клип",
  pv: "Проморолик",
  cm: "Реклама",
};

export const STATUS_LABELS: Record<AnimeStatus, string> = {
  anons: "Анонс",
  ongoing: "Онгоинг",
  released: "Вышло",
};

export const RATING_LABELS: Record<AnimeRating, string> = {
  none: "Без рейтинга",
  g: "G — для всех",
  pg: "PG — для детей",
  pg_13: "PG-13 — от 13 лет",
  r: "R-17 — насилие",
  r_plus: "R+ — от 17 лет",
  rx: "Rx — хентай",
};

export const ORDER_LABELS: Record<AnimeOrder, string> = {
  popularity: "По популярности",
  ranked: "По рейтингу",
  aired_on: "По дате выхода",
  name: "По алфавиту",
  episodes: "По числу эпизодов",
  random: "Случайно",
};

const SEASON_LABELS: Record<string, string> = {
  winter: "Зима",
  spring: "Весна",
  summer: "Лето",
  fall: "Осень",
};

/** Russian title first, with the romaji name as a fallback. */
export function animeTitle(anime: Pick<AnimeCard, "name" | "russian">) {
  return anime.russian || anime.name;
}

export function formatSeason(season: string | null | undefined) {
  if (!season) return null;
  const match = season.match(/^(winter|spring|summer|fall)_(\d{4})$/);
  if (!match) return season;
  return `${SEASON_LABELS[match[1]]} ${match[2]}`;
}

export function formatScore(score: number | null | undefined) {
  if (!score) return null;
  return score.toFixed(score >= 10 ? 0 : 1).replace(".", ",");
}

export function formatEpisodes(anime: Pick<AnimeCard, "episodes" | "episodesAired" | "status" | "kind">) {
  if (anime.kind === "movie") return null;
  if (anime.status === "ongoing") {
    return anime.episodes ? `${anime.episodesAired} из ${anime.episodes} эп.` : `${anime.episodesAired} эп.`;
  }
  if (!anime.episodes) return null;
  return `${anime.episodes} эп.`;
}

export function pluralRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} мин.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ч. ${m} мин.` : `${h} ч.`;
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(date: string | null | undefined) {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
}

export function animeYear(anime: Pick<AnimeCard, "airedOn">) {
  return anime.airedOn?.year ?? null;
}

/** Strips Shikimori BB-codes like `[character=1]Имя[/character]`, keeping the inner text. */
export function stripBbCodes(text: string | null | undefined) {
  if (!text) return "";
  return text
    .replace(/\[(\w+)(?:=[^\]]*)?\]([\s\S]*?)\[\/\1\]/g, "$2")
    .replace(/\[\/?[\w=:#\s.-]+\]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export const USER_STATUS_LABELS = {
  planned: "Запланировано",
  watching: "Смотрю",
  rewatching: "Пересматриваю",
  completed: "Просмотрено",
  on_hold: "Отложено",
  dropped: "Брошено",
} as const;

export type UserListStatus = keyof typeof USER_STATUS_LABELS;

export const USER_STATUSES = Object.keys(USER_STATUS_LABELS) as UserListStatus[];

/** Keeps the first occurrence of each id — Shikimori pages can overlap. */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
