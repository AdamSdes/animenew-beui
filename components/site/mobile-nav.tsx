"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/motion/drawer";
import { cn } from "@/lib/utils";
import { Logo, NAV_LINKS } from "./site-header";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on route change only
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        className="press grid size-9 place-items-center rounded-full border border-border bg-card/20 text-muted-foreground hover:text-foreground md:hidden"
      >
        <Menu className="size-4" />
      </button>
      <Drawer open={open} onOpenChange={setOpen} side="left" ariaLabel="Меню" className="w-72 gap-6 p-5">
        <Logo />
        <nav className="flex flex-col gap-1" aria-label="Мобильная навигация">
          {[{ href: "/", label: "Главная" }, ...NAV_LINKS].map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Тема</span>
          <ThemeToggle />
        </div>
      </Drawer>
    </>
  );
}
