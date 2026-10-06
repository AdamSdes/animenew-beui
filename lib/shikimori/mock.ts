// Offline fixtures used when SHIKIMORI_MOCK=1 — for working on the UI without
// network access to Shikimori. Titles are real, but the numbers are approximate
// and schedules are generated relative to the current time.

import type { AnimeCard, AnimeDetails, AnimeKind, AnimeSearchParams, AnimeStatus, CalendarEntry, Genre } from "./types";

const GENRES: Genre[] = [
  { id: "1", name: "Action", russian: "Экшен", kind: "genre" },
  { id: "2", name: "Adventure", russian: "Приключения", kind: "genre" },
  { id: "4", name: "Comedy", russian: "Комедия", kind: "genre" },
  { id: "8", name: "Drama", russian: "Драма", kind: "genre" },
  { id: "10", name: "Fantasy", russian: "Фэнтези", kind: "genre" },
  { id: "22", name: "Romance", russian: "Романтика", kind: "genre" },
  { id: "24", name: "Sci-Fi", russian: "Фантастика", kind: "genre" },
  { id: "36", name: "Slice of Life", russian: "Повседневность", kind: "genre" },
  { id: "30", name: "Sports", russian: "Спорт", kind: "genre" },
  { id: "37", name: "Supernatural", russian: "Сверхъестественное", kind: "genre" },
  { id: "117", name: "Suspense", russian: "Триллер", kind: "genre" },
  { id: "7", name: "Mystery", russian: "Детектив", kind: "genre" },
  { id: "14", name: "Horror", russian: "Ужасы", kind: "genre" },
  { id: "40", name: "Psychological", russian: "Психологическое", kind: "theme" },
  { id: "23", name: "School", russian: "Школа", kind: "theme" },
  { id: "18", name: "Mecha", russian: "Меха", kind: "theme" },
  { id: "38", name: "Military", russian: "Военное", kind: "theme" },
  { id: "130", name: "Isekai", russian: "Исэкай", kind: "theme" },
  { id: "19", name: "Music", russian: "Музыка", kind: "theme" },
  { id: "13", name: "Historical", russian: "Исторический", kind: "theme" },
  { id: "27", name: "Shounen", russian: "Сёнэн", kind: "demographic" },
  { id: "42", name: "Seinen", russian: "Сэйнэн", kind: "demographic" },
  { id: "25", name: "Shoujo", russian: "Сёдзё", kind: "demographic" },
];

type Row = [
  id: number,
  name: string,
  russian: string,
  kind: AnimeKind,
  status: AnimeStatus,
  score: number,
  episodes: number,
  episodesAired: number,
  year: number,
  genres: string[],
  studio: string,
];

const ROWS: Row[] = [
  [52991, "Sousou no Frieren", "Провожающая в последний путь Фрирен", "tv", "released", 9.3, 28, 28, 2023, ["2", "8", "10", "27"], "Madhouse"],
  [5114, "Fullmetal Alchemist: Brotherhood", "Стальной алхимик: Братство", "tv", "released", 9.1, 64, 64, 2009, ["1", "2", "8", "10", "38", "27"], "Bones"],
  [9253, "Steins;Gate", "Врата Штейна", "tv", "released", 9.1, 24, 24, 2011, ["8", "24", "117", "40"], "White Fox"],
  [11061, "Hunter x Hunter (2011)", "Охотник х Охотник", "tv", "released", 9.0, 148, 148, 2011, ["1", "2", "10", "27"], "Madhouse"],
  [21, "One Piece", "Ван-Пис", "tv", "ongoing", 8.7, 0, 1146, 1999, ["1", "2", "10", "27"], "Toei Animation"],
  [16498, "Shingeki no Kyojin", "Атака титанов", "tv", "released", 8.5, 25, 25, 2013, ["1", "8", "117", "38", "27"], "Wit Studio"],
  [1535, "Death Note", "Тетрадь смерти", "tv", "released", 8.6, 37, 37, 2006, ["37", "117", "40", "27"], "Madhouse"],
  [40748, "Jujutsu Kaisen", "Магическая битва", "tv", "released", 8.6, 24, 24, 2020, ["1", "37", "23", "27"], "MAPPA"],
  [51009, "Jujutsu Kaisen 2nd Season", "Магическая битва 2", "tv", "released", 8.8, 23, 23, 2023, ["1", "37", "23", "27"], "MAPPA"],
  [38000, "Kimetsu no Yaiba", "Клинок, рассекающий демонов", "tv", "released", 8.5, 26, 26, 2019, ["1", "37", "13", "27"], "ufotable"],
  [32281, "Kimi no Na wa.", "Твоё имя", "movie", "released", 8.8, 1, 1, 2016, ["8", "22", "37"], "CoMix Wave Films"],
  [199, "Sen to Chihiro no Kamikakushi", "Унесённые призраками", "movie", "released", 8.8, 1, 1, 2001, ["2", "37"], "Studio Ghibli"],
  [1, "Cowboy Bebop", "Ковбой Бибоп", "tv", "released", 8.8, 26, 26, 1998, ["1", "8", "24"], "Sunrise"],
  [30, "Shinseiki Evangelion", "Евангелион", "tv", "released", 8.4, 26, 26, 1995, ["1", "8", "24", "18", "40"], "Gainax"],
  [30276, "One Punch Man", "Ванпанчмен", "tv", "released", 8.5, 12, 12, 2015, ["1", "4", "42"], "Madhouse"],
  [50265, "Spy x Family", "Семья шпиона", "tv", "released", 8.5, 12, 12, 2022, ["1", "4", "36", "27"], "Wit Studio"],
  [44511, "Chainsaw Man", "Человек-бензопила", "tv", "released", 8.5, 12, 12, 2022, ["1", "37", "14", "27"], "MAPPA"],
  [37521, "Vinland Saga", "Сага о Винланде", "tv", "released", 8.7, 24, 24, 2019, ["1", "2", "8", "13", "42"], "Wit Studio"],
  [33352, "Violet Evergarden", "Вайолет Эвергарден", "tv", "released", 8.7, 13, 13, 2018, ["8", "10", "36"], "Kyoto Animation"],
  [31240, "Re:Zero kara Hajimeru Isekai Seikatsu", "Re:Zero. Жизнь с нуля в альтернативном мире", "tv", "released", 8.2, 25, 25, 2016, ["8", "10", "117", "130"], "White Fox"],
  [20583, "Haikyuu!!", "Волейбол!!", "tv", "released", 8.4, 25, 25, 2014, ["4", "30", "23", "27"], "Production I.G"],
  [32182, "Mob Psycho 100", "Моб Психо 100", "tv", "released", 8.5, 12, 12, 2016, ["1", "4", "37", "27"], "Bones"],
  [52299, "Ore dake Level Up na Ken", "Поднятие уровня в одиночку", "tv", "released", 8.3, 12, 12, 2024, ["1", "2", "10"], "A-1 Pictures"],
  [57334, "Dandadan", "Дандадан", "tv", "released", 8.6, 12, 12, 2024, ["1", "4", "37", "27"], "Science SARU"],
  [22319, "Tokyo Ghoul", "Токийский гуль", "tv", "released", 7.8, 12, 12, 2014, ["1", "14", "37", "42"], "Pierrot"],
  [20, "Naruto", "Наруто", "tv", "released", 8.0, 220, 220, 2002, ["1", "2", "10", "27"], "Pierrot"],
  [21459, "Boku no Hero Academia", "Моя геройская академия", "tv", "released", 7.9, 13, 13, 2016, ["1", "23", "27"], "Bones"],
  [28851, "Koe no Katachi", "Форма голоса", "movie", "released", 8.9, 1, 1, 2016, ["8", "23", "25"], "Kyoto Animation"],
  [19, "Monster", "Монстр", "tv", "released", 8.9, 74, 74, 2004, ["8", "7", "117", "40", "42"], "Madhouse"],
  [2904, "Code Geass: Hangyaku no Lelouch R2", "Код Гиас: Восставший Лелуш R2", "tv", "released", 8.9, 25, 25, 2008, ["1", "8", "24", "18", "38"], "Sunrise"],
  [60001, "Ongoing Example: Autumn Story", "Осенняя история", "tv", "ongoing", 8.1, 12, 4, 2026, ["8", "22", "36"], "CloverWorks"],
  [60002, "Ongoing Example: Iron Comet", "Железная комета", "tv", "ongoing", 7.9, 24, 6, 2026, ["1", "24", "18"], "Trigger"],
  [60003, "Ongoing Example: Spirit Lantern", "Фонарь духов", "tv", "ongoing", 8.3, 13, 5, 2026, ["2", "10", "37"], "MAPPA"],
  [60004, "Ongoing Example: Night Shift Detective", "Ночная смена детектива", "tv", "ongoing", 7.6, 12, 3, 2026, ["7", "117", "42"], "Production I.G"],
  [60005, "Ongoing Example: Rookie Setter", "Новичок-связующий", "tv", "ongoing", 7.8, 25, 7, 2026, ["4", "30", "23", "27"], "Production I.G"],
  [60006, "Announcement Example: Winter Requiem", "Зимний реквием", "movie", "anons", 0, 1, 0, 2027, ["8", "10"], "ufotable"],
  [60007, "Announcement Example: Starfall Academy", "Академия звездопада", "tv", "anons", 0, 12, 0, 2027, ["4", "10", "23", "130"], "A-1 Pictures"],
];

const genreById = new Map(GENRES.map((g) => [g.id, g]));

function toCard(row: Row): AnimeCard {
  const [id, name, russian, kind, status, score, episodes, episodesAired, year, genres] = row;
  return {
    id: String(id),
    name,
    russian,
    english: null,
    japanese: null,
    kind,
    status,
    score: score || null,
    episodes,
    episodesAired,
    airedOn: { year, month: 4, day: 1, date: `${year}-04-01` },
    releasedOn: status === "released" ? { year, month: 9, day: 30, date: `${year}-09-30` } : null,
    season: status === "ongoing" ? `fall_${year}` : null,
    nextEpisodeAt: status === "ongoing" ? nextEpisodeFor(id).toISOString() : null,
    poster: null,
    genres: genres.map((g) => {
      const genre = genreById.get(g) as Genre;
      return { id: genre.id, russian: genre.russian, kind: genre.kind };
    }),
  };
}

function nextEpisodeFor(id: number) {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + ((id * 37) % (7 * 24)) + 1);
  return date;
}

const CARDS = ROWS.map(toCard);

function matchesYear(card: AnimeCard, season: string) {
  const year = card.airedOn?.year;
  if (!year) return false;
  return season.split(",").some((part) => {
    const range = part.match(/^(\d{4})_(\d{4})$/);
    if (range) return year >= Number(range[1]) && year <= Number(range[2]);
    const single = part.match(/(\d{4})$/);
    return single ? year === Number(single[1]) : true;
  });
}

export function searchAnimes(params: AnimeSearchParams): AnimeCard[] {
  const query = params.search?.trim().toLowerCase();
  const kinds = params.kind?.split(",");
  const statuses = params.status?.split(",");
  const genres = params.genre?.split(",");
  const ids = params.ids?.split(",");
  let list = CARDS.filter(
    (card) =>
      (!query || card.name.toLowerCase().includes(query) || card.russian?.toLowerCase().includes(query)) &&
      (!kinds || (card.kind && kinds.includes(card.kind))) &&
      (!statuses || (card.status && statuses.includes(card.status))) &&
      (!genres || genres.every((g) => card.genres?.some((cg) => cg.id === g))) &&
      (!params.score || (card.score ?? 0) >= params.score) &&
      (!params.season || matchesYear(card, params.season)) &&
      (!ids || ids.includes(card.id)),
  );
  const order = params.order ?? "popularity";
  if (order === "ranked") list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  if (order === "name") list = [...list].sort((a, b) => (a.russian ?? a.name).localeCompare(b.russian ?? b.name, "ru"));
  if (order === "aired_on") list = [...list].sort((a, b) => (b.airedOn?.year ?? 0) - (a.airedOn?.year ?? 0));
  if (order === "episodes") list = [...list].sort((a, b) => b.episodes - a.episodes);
  const limit = params.limit ?? 30;
  const page = params.page ?? 1;
  return list.slice((page - 1) * limit, page * limit);
}

export function getAnimesByIds(ids: string[]): AnimeCard[] {
  return ids.map((id) => CARDS.find((c) => c.id === id)).filter((c): c is AnimeCard => Boolean(c));
}

export function getGenres(): Genre[] {
  return GENRES;
}

export function getAnime(id: string): AnimeDetails | null {
  const row = ROWS.find((r) => String(r[0]) === id);
  if (!row) return null;
  const card = toCard(row);
  const siblings = CARDS.filter((c) => c.id !== id).slice(0, 3);
  return {
    ...card,
    url: `/animes/${id}`,
    malId: id,
    synonyms: [],
    licenseNameRu: null,
    franchise: null,
    rating: "pg_13",
    duration: card.kind === "movie" ? 110 : 24,
    description:
      "Демо-описание: это данные из офлайн-режима. Подключите доступ к Shikimori, чтобы увидеть настоящее описание, персонажей и связанные тайтлы.\n\nЗдесь будет синопсис тайтла с сайта Shikimori.",
    fandubbers: ["AniLibria", "AniDUB"],
    fansubbers: ["Crunchyroll"],
    studios: [{ id: "1", name: row[10], imageUrl: null }],
    videos: [],
    screenshots: [],
    characterRoles: [
      { id: "c1", rolesRu: ["Main"], rolesEn: ["Main"], character: { id: "1", name: "Main Hero", russian: "Главный герой", url: "", poster: null } },
      { id: "c2", rolesRu: ["Main"], rolesEn: ["Main"], character: { id: "2", name: "Heroine", russian: "Героиня", url: "", poster: null } },
      { id: "c3", rolesRu: ["Supporting"], rolesEn: ["Supporting"], character: { id: "3", name: "Rival", russian: "Соперник", url: "", poster: null } },
      { id: "c4", rolesRu: ["Supporting"], rolesEn: ["Supporting"], character: { id: "4", name: "Mentor", russian: "Наставник", url: "", poster: null } },
    ],
    personRoles: [
      { id: "p1", rolesRu: ["Режиссёр"], person: { id: "1", name: "Director", russian: "Режиссёр", url: "", poster: null } },
    ],
    related: siblings.map((s, i) => ({
      id: `r${i}`,
      relationKind: i === 0 ? "sequel" : "other",
      relationText: i === 0 ? "Продолжение" : "Прочее",
      anime: { id: s.id, name: s.name, russian: s.russian, kind: s.kind, status: s.status, airedOn: s.airedOn, poster: null },
      manga: null,
    })),
    scoresStats: [10, 9, 8, 7, 6, 5].map((score, i) => ({ score, count: Math.round(5000 / (i + 1)) })),
    statusesStats: [
      { status: "planned", count: 42000 },
      { status: "watching", count: 18000 },
      { status: "completed", count: 160000 },
      { status: "on_hold", count: 6000 },
      { status: "dropped", count: 4000 },
    ],
    externalLinks: [],
  };
}

export function getCalendar(): CalendarEntry[] {
  return CARDS.filter((c) => c.status === "ongoing")
    .map((anime) => ({
      nextEpisode: anime.episodesAired + 1,
      nextEpisodeAt: anime.nextEpisodeAt as string,
      duration: 24 * 60,
      anime,
    }))
    .sort((a, b) => a.nextEpisodeAt.localeCompare(b.nextEpisodeAt));
}

export function getSimilar(id: string): AnimeCard[] {
  const base = CARDS.find((c) => c.id === id);
  if (!base) return [];
  const genres = new Set(base.genres?.map((g) => g.id));
  return CARDS.filter((c) => c.id !== id)
    .map((c) => ({ c, overlap: c.genres?.filter((g) => genres.has(g.id)).length ?? 0 }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 12)
    .map(({ c }) => c);
}
