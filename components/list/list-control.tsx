"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { type ListActionResult, removeListEntry, type SaveListEntryInput, saveListEntry } from "@/app/actions/list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { useToast } from "@/components/site/providers";
import { LinkButton } from "@/components/site/press-link";
import { USER_STATUS_LABELS, USER_STATUSES, type UserListStatus } from "@/lib/shikimori/format";

type Entry = { status: UserListStatus; score: number | null; episodes: number };
type ListResponse = { entry: Entry | null; signedIn: boolean };

export const SCORE_LABELS: Record<number, string> = {
  10: "Шедевр",
  9: "Великолепно",
  8: "Очень хорошо",
  7: "Хорошо",
  6: "Нормально",
  5: "Более-менее",
  4: "Плохо",
  3: "Очень плохо",
  2: "Ужасно",
  1: "Хуже некуда",
};

const NO_SCORE = "none";

export function ListControl({ animeId, totalEpisodes }: { animeId: string; totalEpisodes: number }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const key = ["list-entry", animeId];
  const { data, isLoading } = useQuery<ListResponse>({
    queryKey: key,
    queryFn: () => fetch(`/api/list/${animeId}`).then((r) => r.json()),
    staleTime: 30_000,
  });
  const [episodesDraft, setEpisodesDraft] = useState<number | null>(null);

  if (isLoading || !data) {
    return <div className="h-10 animate-pulse rounded-full bg-card" aria-hidden="true" />;
  }

  if (!data.signedIn) {
    return (
      <LinkButton href={`/login?next=/anime/${animeId}`} className="w-full">
        <Plus className="size-4" /> Добавить в список
      </LinkButton>
    );
  }

  const entry = data.entry;

  const run = (action: () => Promise<ListActionResult>, optimistic: Entry | null, message: string) => {
    const previous = queryClient.getQueryData<ListResponse>(key);
    queryClient.setQueryData<ListResponse>(key, { signedIn: true, entry: optimistic });
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        queryClient.setQueryData(key, previous);
        showToast({ status: "error", title: result.error });
        return;
      }
      showToast({ status: "success", title: message });
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const save = (patch: Partial<SaveListEntryInput>, message: string) => {
    const status = (patch.status ?? entry?.status ?? "planned") as UserListStatus;
    const next: Entry = {
      status,
      score: patch.score !== undefined ? (patch.score ?? null) : (entry?.score ?? null),
      episodes:
        status === "completed" && totalEpisodes
          ? totalEpisodes
          : (patch.episodes ?? entry?.episodes ?? 0),
    };
    run(
      () => saveListEntry({ animeId, status, score: next.score, episodes: next.episodes }),
      next,
      message,
    );
  };

  const episodes = episodesDraft ?? entry?.episodes ?? 0;
  const commitEpisodes = (value: number) => {
    const clamped = Math.max(0, totalEpisodes ? Math.min(value, totalEpisodes) : value);
    setEpisodesDraft(null);
    const done = totalEpisodes > 0 && clamped === totalEpisodes;
    save(
      { episodes: clamped, status: done ? "completed" : entry?.status === "planned" ? "watching" : entry?.status },
      done ? "Отмечено как просмотренное" : `Просмотрено эпизодов: ${clamped}`,
    );
  };

  return (
    <div className="space-y-3">
      <Select
        value={entry?.status}
        onValueChange={(status) => save({ status: status as UserListStatus }, `Статус: ${USER_STATUS_LABELS[status as UserListStatus]}`)}
        disabled={pending}
      >
        <SelectTrigger className={entry ? undefined : "bg-primary text-primary-foreground [&_*]:text-primary-foreground"}>
          <SelectValue placeholder="Добавить в список" />
        </SelectTrigger>
        <SelectContent>
          {USER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {USER_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {entry ? (
        <>
          <Select
            value={entry.score ? String(entry.score) : NO_SCORE}
            onValueChange={(v) => save({ score: v === NO_SCORE ? null : Number(v) }, v === NO_SCORE ? "Оценка снята" : `Оценка: ${v}`)}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_SCORE}>Без оценки</SelectItem>
              {Object.keys(SCORE_LABELS)
                .map(Number)
                .sort((a, b) => b - a)
                .map((score) => (
                  <SelectItem key={score} value={String(score)}>
                    {`${score} — ${SCORE_LABELS[score]}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1">
            <button
              type="button"
              aria-label="Минус эпизод"
              disabled={pending || episodes <= 0}
              onClick={() => commitEpisodes(episodes - 1)}
              className="press grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="flex-1 text-center text-sm tabular-nums text-foreground">
              {episodes}
              <span className="text-muted-foreground"> / {totalEpisodes || "?"} эп.</span>
            </span>
            <button
              type="button"
              aria-label="Плюс эпизод"
              disabled={pending || (totalEpisodes > 0 && episodes >= totalEpisodes)}
              onClick={() => commitEpisodes(episodes + 1)}
              className="press grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => removeListEntry(animeId), null, "Удалено из списка")}
            className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Удалить из списка
          </button>
        </>
      ) : null}
    </div>
  );
}
