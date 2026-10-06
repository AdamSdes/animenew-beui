"use client";

import { ListVideo, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/motion/popover";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar } from "./avatar";
import { LinkButton } from "./press-link";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

export function UserMenu() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (isPending) {
    return <span className="size-9 animate-pulse rounded-full bg-card" aria-hidden="true" />;
  }

  if (!data) {
    return (
      <LinkButton href="/login" variant="primary" size="sm" className="h-9 px-4">
        Войти
      </LinkButton>
    );
  }

  const { user } = data;
  const handle = user.username ?? user.id;

  return (
    <Popover side="bottom" align="end" open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          aria-label="Меню профиля"
          className="press grid size-9 place-items-center rounded-full border border-border bg-card/20"
        >
          <Avatar name={user.name} image={user.image} size={28} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1.5">
        <div className="px-2.5 pt-1.5 pb-2">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          {user.username ? <p className="truncate text-xs text-muted-foreground">@{user.username}</p> : null}
        </div>
        <div className="my-1 h-px bg-border" />
        <Link href={`/u/${handle}`} className={itemClass} onClick={() => setOpen(false)}>
          <UserRound className="size-4" /> Профиль
        </Link>
        <Link href={`/u/${handle}/list`} className={itemClass} onClick={() => setOpen(false)}>
          <ListVideo className="size-4" /> Мой список
        </Link>
        <Link href="/settings" className={itemClass} onClick={() => setOpen(false)}>
          <Settings className="size-4" /> Настройки
        </Link>
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          className={itemClass}
          onClick={async () => {
            setOpen(false);
            await signOut();
            router.refresh();
          }}
        >
          <LogOut className="size-4" /> Выйти
        </button>
      </PopoverContent>
    </Popover>
  );
}
