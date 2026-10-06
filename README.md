# animenew

Аниме-сайт на данных [Shikimori](https://shikimori.one) и компонентах [beUI](https://beui.dev):
каталог с фильтрами, страницы тайтлов, календарь онгоингов, топ-100, аккаунты, личные списки
и комментарии.

## Стек

| Слой | Что используется |
| --- | --- |
| Фреймворк | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | beUI (исходники в `components/motion`, `components/charts`), Tailwind CSS v4, motion, Geist |
| Данные о тайтлах | Shikimori GraphQL + REST (`/api/calendar`, `/api/animes/:id/similar`) |
| База | PostgreSQL + Drizzle ORM (миграции в `drizzle/`) |
| Авторизация | Better Auth: email/пароль, имя пользователя, опционально GitHub / Discord / Google |
| Клиентские запросы | TanStack Query (бесконечная прокрутка, поиск, комментарии) |
| Линтер | Biome |

## Быстрый старт

Нужны [bun](https://bun.sh) (или Node 22 + npm) и Docker для Postgres.

```bash
bun install
cp .env.example .env.local      # и задайте BETTER_AUTH_SECRET: openssl rand -base64 32
bun run db:up                   # Postgres в Docker (docker-compose.yml)
bun run db:migrate              # создать таблицы
bun dev                         # http://localhost:3000
```

Без доступа к Shikimori можно включить демо-данные: `SHIKIMORI_MOCK=1` в `.env.local`.
На сайте при этом в подвале появляется плашка «Демо-данные».

## Скрипты

| Команда | Что делает |
| --- | --- |
| `bun dev` | dev-сервер |
| `bun run build` / `bun start` | продакшен-сборка и запуск |
| `bun run check` | `tsc --noEmit` + `biome lint` |
| `bun run db:generate` | новая миграция после изменения `lib/db/schema.ts` |
| `bun run db:migrate` | применить миграции |
| `bun run db:studio` | Drizzle Studio |

## Страницы

- `/` — главная: hero с каруселью, онгоинги, популярное, жанры, анонсы, лучшее
- `/catalog` — поиск и фильтры (тип, статус, жанры, год, оценка, сортировка), всё в URL; бесконечная подгрузка
- `/anime/[id]` — тайтл: описание, информация, оценки, персонажи, связанное, похожее, видео, кадры, список, обсуждение
- `/calendar` — расписание серий по дням (время МСК)
- `/top` — топ-100 по оценкам
- `/login`, `/register`, `/settings` — аккаунт
- `/u/[username]` — профиль: статистика, тепловая карта активности, «смотрит сейчас», лента действий
- `/u/[username]/list` — список по статусам
- Поиск — `⌘K` / `Ctrl+K` из любого места

## Как устроено

**Shikimori** (`lib/shikimori/`). Все запросы идут с сервера: так у них правильный `User-Agent`
(Shikimori требует название приложения), они укладываются в лимит 5 запросов в секунду и 90 в
минуту (очередь в `client.ts`) и кэшируются Next (`force-cache` + `revalidate`). Аргументы GraphQL
подставляются литералами с экранированием и белыми списками, без переменных: так не зависим от
имён скалярных типов схемы. Клиентские компоненты ходят через свои роуты `/api/catalog` и
`/api/search`. Страницы тайтлов работают через ISR: рендерятся при первом заходе и кэшируются на час.
Если Shikimori недоступен во время сборки, статические страницы собираются с пустыми секциями,
а в рантайме ISR продолжает отдавать последнюю удачную версию.

**База** (`lib/db/schema.ts`). Таблицы Better Auth (`user`, `session`, `account`, `verification`) и таблицы
приложения: `anime_list_entry` (список, хранит снимок названия и постера, чтобы профиль не дёргал
API), `list_event` (история для тепловой карты), `comment` (ветки ответов в один уровень,
счётчики лайков и ответов), `comment_like`.

**Мутации.** Server actions в `app/actions/` (список и комментарии), с проверкой сессии и zod-валидацией.
Для комментариев есть ограничение «не чаще раза в 10 секунд». Корневой комментарий с ответами при
удалении остаётся «надгробием», чтобы ветка не рассыпалась. Роль `admin` (поле `user.role`) может
удалять любые комментарии; выдаётся вручную в БД.

**beUI.** Компоненты скопированы из [starc007/ui-components](https://github.com/starc007/ui-components)
(MIT, см. `components/motion/LICENSE`) вместе с хелперами из `lib/`. Тема (токены, тёмная и светлая)
лежит в `app/globals.css`. Локальные правки исходников: у `command-palette` появились `onQueryChange`,
`shouldFilter` и `labels` для асинхронного поиска, у `heat-calendar` — русская локаль.
Скилл для агентов: `.claude/skills/beui`.

## Вход через соцсети

Задайте пару `*_CLIENT_ID` / `*_CLIENT_SECRET` в `.env.local`: кнопка появится сама. Callback URL
для провайдера — `{BETTER_AUTH_URL}/api/auth/callback/{github|discord|google}`.
