import "server-only";
import { cache } from "react";
import { absoluteUrl, isShikimoriMock, shikiGraphQL, shikiRest } from "./client";
import * as mock from "./mock";
import {
  ANIME_ORDERS,
  type AnimeCard,
  type AnimeDetails,
  type AnimeSearchParams,
  type CalendarEntry,
  type Genre,
} from "./types";

const POSTER = "poster { mainUrl main2xUrl previewUrl }";

const CARD_FIELDS = `
  id name russian english japanese kind status score episodes episodesAired
  airedOn { year month day date } releasedOn { year month day date }
  season nextEpisodeAt
  ${POSTER}
  genres { id russian kind }
`;

const DETAILS_FIELDS = `
  ${CARD_FIELDS}
  url malId synonyms licenseNameRu franchise rating duration description
  fandubbers fansubbers
  studios { id name imageUrl }
  videos { id name url kind playerUrl imageUrl }
  screenshots { id originalUrl x332Url }
  characterRoles {
    id rolesRu rolesEn
    character { id name russian url poster { mainUrl previewUrl } }
  }
  personRoles {
    id rolesRu
    person { id name russian url poster { mainUrl previewUrl } }
  }
  related {
    id relationKind relationText
    anime { id name russian kind status airedOn { year month day date } ${POSTER} }
    manga { id name russian kind url airedOn { year month day date } poster { mainUrl previewUrl } }
  }
  scoresStats { score count }
  statusesStats { status count }
  externalLinks { kind url }
`;

/** Marks a value that must be emitted as a bare GraphQL enum literal. */
type EnumLiteral = { enum: string };

type ArgValue = string | number | boolean | EnumLiteral | undefined | null;

/**
 * Inlines arguments as GraphQL literals. JSON string escaping is valid GraphQL
 * string syntax, numbers are truncated, and enum literals are whitelisted by the
 * caller and re-checked here, so user input cannot break out of the query.
 */
function gqlArgs(args: Record<string, ArgValue>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object") {
      if (!/^[a-z_]+$/.test(value.enum)) throw new Error(`Invalid enum literal: ${value.enum}`);
      parts.push(`${key}: ${value.enum}`);
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) continue;
      parts.push(`${key}: ${Math.trunc(value)}`);
    } else if (typeof value === "boolean") {
      parts.push(`${key}: ${value}`);
    } else {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return parts.length ? `(${parts.join(", ")})` : "";
}

/** Keeps comma-separated filter lists to ids/keywords Shikimori understands. */
function cleanList(value: string | undefined, pattern = /^!?[a-z0-9_]+$/): string | undefined {
  if (!value) return undefined;
  const items = value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => pattern.test(v));
  return items.length ? items.join(",") : undefined;
}

export const PAGE_SIZE = 30;

/**
 * Static pages are prerendered at build time, when Shikimori may be unreachable.
 * Then we render empty sections instead of failing the build. At runtime the
 * error propagates, so ISR keeps serving the last good version of the page.
 */
export async function softDuringBuild<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("[shikimori] build-time fetch failed, rendering empty section:", (error as Error).message);
      return fallback;
    }
    throw error;
  }
}

export async function searchAnimes(params: AnimeSearchParams = {}): Promise<AnimeCard[]> {
  if (isShikimoriMock) return mock.searchAnimes(params);
  const order = params.order && ANIME_ORDERS.includes(params.order) ? params.order : "popularity";
  const args = gqlArgs({
    search: params.search?.trim().slice(0, 100),
    page: params.page && params.page > 0 ? params.page : 1,
    limit: Math.min(Math.max(params.limit ?? PAGE_SIZE, 1), 50),
    order: { enum: order },
    kind: cleanList(params.kind),
    status: cleanList(params.status),
    season: cleanList(params.season),
    score: params.score && params.score >= 1 && params.score <= 9 ? params.score : undefined,
    genre: cleanList(params.genre),
    rating: cleanList(params.rating),
    ids: cleanList(params.ids, /^\d+$/),
    excludeIds: cleanList(params.excludeIds, /^\d+$/),
    censored: true,
  });
  const data = await shikiGraphQL<{ animes: AnimeCard[] }>(
    `{ animes${args} { ${CARD_FIELDS} } }`,
    {},
    // Searches go stale quickly only for ongoings; an hour keeps us far from rate limits.
    { revalidate: params.search ? 600 : 3600, tags: ["animes"] },
  );
  return data.animes;
}

export const getAnime = cache(async (id: string): Promise<AnimeDetails | null> => {
  if (!/^\d+$/.test(id)) return null;
  if (isShikimoriMock) return mock.getAnime(id);
  const data = await shikiGraphQL<{ animes: AnimeDetails[] }>(
    `{ animes${gqlArgs({ ids: id, limit: 1, censored: false })} { ${DETAILS_FIELDS} } }`,
    {},
    { revalidate: 3600, tags: [`anime:${id}`] },
  );
  return data.animes[0] ?? null;
});

/** Cards for a known set of ids, in the order the ids were given. */
export async function getAnimesByIds(ids: string[]): Promise<AnimeCard[]> {
  const clean = [...new Set(ids.filter((id) => /^\d+$/.test(id)))];
  if (!clean.length) return [];
  if (isShikimoriMock) return mock.getAnimesByIds(clean);
  const chunks: string[][] = [];
  for (let i = 0; i < clean.length; i += 50) chunks.push(clean.slice(i, i + 50));
  const results = await Promise.all(
    chunks.map((chunk) =>
      shikiGraphQL<{ animes: AnimeCard[] }>(
        `{ animes${gqlArgs({ ids: chunk.join(","), limit: chunk.length, censored: false })} { ${CARD_FIELDS} } }`,
        {},
        { revalidate: 3600, tags: ["animes"] },
      ),
    ),
  );
  const byId = new Map(results.flatMap((r) => r.animes).map((a) => [a.id, a]));
  return clean.map((id) => byId.get(id)).filter((a): a is AnimeCard => Boolean(a));
}

export const getGenres = cache(async (): Promise<Genre[]> => {
  if (isShikimoriMock) return mock.getGenres();
  const data = await shikiGraphQL<{ genres: Genre[] }>(
    "{ genres(entryType: Anime) { id name russian kind } }",
    {},
    { revalidate: 86400, tags: ["genres"] },
  );
  return data.genres;
});

type RestAnime = {
  id: number;
  name: string;
  russian: string | null;
  image: { original: string; preview: string } | null;
  kind: AnimeCard["kind"];
  score: string | null;
  status: AnimeCard["status"];
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  released_on: string | null;
};

function fromRest(anime: RestAnime): AnimeCard {
  const original = absoluteUrl(anime.image?.original);
  const preview = absoluteUrl(anime.image?.preview);
  const missing = !original || original.includes("missing_");
  const toDate = (date: string | null) => (date ? { year: Number(date.slice(0, 4)), date } : null);
  return {
    id: String(anime.id),
    name: anime.name,
    russian: anime.russian || null,
    english: null,
    japanese: null,
    kind: anime.kind,
    status: anime.status,
    score: anime.score ? Number(anime.score) : null,
    episodes: anime.episodes,
    episodesAired: anime.episodes_aired,
    airedOn: toDate(anime.aired_on),
    releasedOn: toDate(anime.released_on),
    season: null,
    nextEpisodeAt: null,
    poster: missing ? null : { mainUrl: original, main2xUrl: original, previewUrl: preview ?? original },
    genres: null,
  };
}

export async function getCalendar(): Promise<CalendarEntry[]> {
  if (isShikimoriMock) return mock.getCalendar();
  type RestEntry = { next_episode: number; next_episode_at: string; duration: number | null; anime: RestAnime };
  const data = await shikiRest<RestEntry[] | { calendars: RestEntry[] }>("/api/calendar?censored=true", {
    revalidate: 1800,
    tags: ["calendar"],
  });
  const entries = Array.isArray(data) ? data : data.calendars;
  return entries.map((entry) => ({
    nextEpisode: entry.next_episode,
    nextEpisodeAt: entry.next_episode_at,
    duration: entry.duration,
    anime: fromRest(entry.anime),
  }));
}

export async function getSimilar(id: string): Promise<AnimeCard[]> {
  if (!/^\d+$/.test(id)) return [];
  if (isShikimoriMock) return mock.getSimilar(id);
  const data = await shikiRest<RestAnime[]>(`/api/animes/${id}/similar`, {
    revalidate: 86400,
    tags: [`anime:${id}`],
  });
  return data.slice(0, 18).map(fromRest);
}
