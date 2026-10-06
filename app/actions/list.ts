"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { animeListEntry, listEvent, listStatus } from "@/lib/db/schema";
import { getAnime } from "@/lib/shikimori/api";
import { animeTitle } from "@/lib/shikimori/format";

const SaveInput = z.object({
  animeId: z.string().regex(/^\d+$/),
  status: z.enum(listStatus.enumValues),
  score: z.number().int().min(1).max(10).nullable().optional(),
  episodes: z.number().int().min(0).max(5000).optional(),
});

export type SaveListEntryInput = z.infer<typeof SaveInput>;

export type ListActionResult = { ok: true } | { ok: false; error: string };

export async function saveListEntry(input: SaveListEntryInput): Promise<ListActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Нужно войти в аккаунт" };
  const parsed = SaveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Некорректные данные" };
  const { animeId, status } = parsed.data;

  const anime = await getAnime(animeId).catch(() => null);
  if (!anime) return { ok: false, error: "Тайтл не найден" };

  const total = anime.episodes || null;
  let episodes = parsed.data.episodes;
  if (status === "completed" && total) episodes = total;
  if (episodes !== undefined && total) episodes = Math.min(episodes, total);
  const score = parsed.data.score;

  const snapshot = {
    animeName: anime.name,
    animeRussian: anime.russian,
    animePoster: anime.poster?.mainUrl ?? null,
    animeKind: anime.kind,
    animeEpisodes: total,
    animeYear: anime.airedOn?.year ?? null,
  };

  await db.transaction(async (tx) => {
    await tx
      .insert(animeListEntry)
      .values({
        userId: session.user.id,
        animeId,
        status,
        score: score ?? null,
        episodes: episodes ?? 0,
        ...snapshot,
      })
      .onConflictDoUpdate({
        target: [animeListEntry.userId, animeListEntry.animeId],
        set: {
          status,
          ...(score !== undefined ? { score } : {}),
          ...(episodes !== undefined ? { episodes } : {}),
          ...snapshot,
          updatedAt: new Date(),
        },
      });
    await tx.insert(listEvent).values({
      userId: session.user.id,
      animeId,
      animeTitle: animeTitle(anime),
      status,
      episodes: episodes ?? null,
      score: score ?? null,
    });
  });
  return { ok: true };
}

export async function removeListEntry(animeId: string): Promise<ListActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Нужно войти в аккаунт" };
  if (!/^\d+$/.test(animeId)) return { ok: false, error: "Некорректные данные" };
  await db
    .delete(animeListEntry)
    .where(and(eq(animeListEntry.userId, session.user.id), eq(animeListEntry.animeId, animeId)));
  return { ok: true };
}
