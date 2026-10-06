"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/motion/button";
import { LinkButton } from "@/components/site/press-link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Что-то пошло не так</h1>
      <p className="text-sm text-muted-foreground">
        Возможно, Shikimori временно недоступен. Попробуйте обновить страницу через минуту.
      </p>
      {error.digest ? <code className="text-xs text-muted-foreground">{error.digest}</code> : null}
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" /> Повторить
        </Button>
        <LinkButton href="/" variant="secondary">
          На главную
        </LinkButton>
      </div>
    </div>
  );
}
