"use client";

import { Search } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { SearchPalette } from "./search-palette";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/calendar", label: "Календарь" },
  { href: "/top", label: "Топ" },
] as const;

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
      <span
        aria-hidden="true"
        className="grid size-6 place-items-center rounded-lg bg-brand-accent text-[11px] font-bold text-background"
      >
        a
      </span>
      <span>
        anime<span className="text-muted-foreground">new</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Logo />
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Основная навигация">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="press flex h-9 items-center gap-2 rounded-full border border-border bg-card/20 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:w-56"
          >
            <Search aria-hidden="true" className="size-4" />
            <span className="hidden flex-1 text-left sm:inline">Поиск аниме…</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] sm:inline-block">
              ⌘K
            </kbd>
            <span className="sr-only sm:hidden">Поиск</span>
          </button>
          <ThemeToggle className="hidden sm:inline-flex" />
          <UserMenu />
        </div>
      </div>
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
