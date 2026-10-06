import Link from "next/link";
import { Logo } from "./site-header";

export function SiteFooter({ mock }: { mock: boolean }) {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Каталог аниме, календарь онгоингов, списки и обсуждения. Данные о тайтлах —{" "}
            <a href="https://shikimori.one" target="_blank" rel="noreferrer" className="underline underline-offset-4">
              Shikimori
            </a>
            , интерфейс —{" "}
            <a href="https://beui.dev" target="_blank" rel="noreferrer" className="underline underline-offset-4">
              beUI
            </a>
            .
          </p>
          {mock ? (
            <p className="inline-flex rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs text-warning">
              Демо-данные: SHIKIMORI_MOCK=1
            </p>
          ) : null}
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Навигация в подвале">
          <Link href="/catalog" className="text-muted-foreground hover:text-foreground">Каталог</Link>
          <Link href="/calendar" className="text-muted-foreground hover:text-foreground">Календарь</Link>
          <Link href="/catalog?status=ongoing" className="text-muted-foreground hover:text-foreground">Онгоинги</Link>
          <Link href="/top" className="text-muted-foreground hover:text-foreground">Топ</Link>
          <Link href="/catalog?status=anons" className="text-muted-foreground hover:text-foreground">Анонсы</Link>
          <Link href="/catalog?kind=movie" className="text-muted-foreground hover:text-foreground">Фильмы</Link>
        </nav>
      </div>
    </footer>
  );
}
