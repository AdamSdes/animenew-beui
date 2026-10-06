// Shapes of the Shikimori data this app selects. Field names follow the
// GraphQL schema (camelCase); REST payloads are mapped onto the same shapes.

export const ANIME_KINDS = ["tv", "movie", "ova", "ona", "special", "tv_special", "music", "pv", "cm"] as const;
export type AnimeKind = (typeof ANIME_KINDS)[number];

export const ANIME_STATUSES = ["anons", "ongoing", "released"] as const;
export type AnimeStatus = (typeof ANIME_STATUSES)[number];

export const ANIME_RATINGS = ["none", "g", "pg", "pg_13", "r", "r_plus", "rx"] as const;
export type AnimeRating = (typeof ANIME_RATINGS)[number];

export const ANIME_ORDERS = ["popularity", "ranked", "aired_on", "name", "episodes", "random"] as const;
export type AnimeOrder = (typeof ANIME_ORDERS)[number];

export type GenreKind = "genre" | "theme" | "demographic";

export type IncompleteDate = {
  year: number | null;
  month?: number | null;
  day?: number | null;
  date: string | null;
};

export type Poster = {
  mainUrl: string;
  main2xUrl: string;
  previewUrl: string;
};

export type Genre = {
  id: string;
  name: string;
  russian: string;
  kind: GenreKind;
};

/** Fields needed to render an anime card or list row. */
export type AnimeCard = {
  id: string;
  name: string;
  russian: string | null;
  english: string | null;
  japanese: string | null;
  kind: AnimeKind | null;
  status: AnimeStatus | null;
  score: number | null;
  episodes: number;
  episodesAired: number;
  airedOn: IncompleteDate | null;
  releasedOn: IncompleteDate | null;
  season: string | null;
  nextEpisodeAt: string | null;
  poster: Poster | null;
  genres: Pick<Genre, "id" | "russian" | "kind">[] | null;
};

export type Studio = { id: string; name: string; imageUrl: string | null };

export type Video = {
  id: string;
  name: string | null;
  url: string;
  kind: string;
  playerUrl: string;
  imageUrl: string;
};

export type Screenshot = { id: string; originalUrl: string; x332Url: string };

export type CharacterRole = {
  id: string;
  rolesRu: string[];
  rolesEn: string[];
  character: {
    id: string;
    name: string;
    russian: string | null;
    url: string;
    poster: Pick<Poster, "mainUrl" | "previewUrl"> | null;
  };
};

export type PersonRole = {
  id: string;
  rolesRu: string[];
  person: {
    id: string;
    name: string;
    russian: string | null;
    url: string;
    poster: Pick<Poster, "mainUrl" | "previewUrl"> | null;
  };
};

export type Related = {
  id: string;
  relationKind: string;
  relationText: string;
  anime: Pick<AnimeCard, "id" | "name" | "russian" | "kind" | "status" | "airedOn" | "poster"> | null;
  manga: {
    id: string;
    name: string;
    russian: string | null;
    kind: string | null;
    url: string;
    airedOn: IncompleteDate | null;
    poster: Pick<Poster, "mainUrl" | "previewUrl"> | null;
  } | null;
};

export type ExternalLink = { kind: string; url: string };

/** Everything the title page shows. */
export type AnimeDetails = AnimeCard & {
  url: string;
  malId: string | null;
  synonyms: string[];
  licenseNameRu: string | null;
  franchise: string | null;
  rating: AnimeRating | null;
  duration: number | null;
  description: string | null;
  studios: Studio[];
  videos: Video[];
  screenshots: Screenshot[];
  characterRoles: CharacterRole[] | null;
  personRoles: PersonRole[] | null;
  related: Related[] | null;
  scoresStats: { score: number; count: number }[] | null;
  statusesStats: { status: string; count: number }[] | null;
  externalLinks: ExternalLink[] | null;
  fandubbers: string[];
  fansubbers: string[];
};

export type CalendarEntry = {
  nextEpisode: number;
  nextEpisodeAt: string;
  /** Episode duration in seconds, when known. */
  duration: number | null;
  anime: AnimeCard;
};

export type AnimeSearchParams = {
  search?: string;
  page?: number;
  limit?: number;
  order?: AnimeOrder;
  /** Comma-separated kinds, e.g. `tv,movie`. */
  kind?: string;
  /** Comma-separated statuses. */
  status?: string;
  /** Season filter in Shikimori syntax: `2024`, `2019_2024`, `summer_2024`. */
  season?: string;
  /** Minimal score, 1–9. */
  score?: number;
  /** Comma-separated genre ids. */
  genre?: string;
  rating?: string;
  ids?: string;
  excludeIds?: string;
};
