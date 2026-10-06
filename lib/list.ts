import "server-only";
import { and, count, desc, eq, gte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { animeListEntry, type ListStatus, listEvent, user } from "@/lib/db/schema";

export type ListEntry = typeof animeListEntry.$inferSelect;

export async function getListEntry(userId: string, animeId: string): Promise<ListEntry | null> {
  const [entry] = await db
    .select()
    .from(animeListEntry)
    .where(and(eq(animeListEntry.userId, userId), eq(animeListEntry.animeId, animeId)))
    .limit(1);
  return entry ?? null;
}

const publicUserColumns = {
  id: user.id,
  name: user.name,
  username: user.username,
  displayUsername: user.displayUsername,
  image: user.image,
  bio: user.bio,
  createdAt: user.createdAt,
};

/** Profiles are addressed by username; users without one fall back to their id. */
export async function getUserByHandle(handle: string) {
  const [found] = await db
    .select(publicUserColumns)
    .from(user)
    .where(or(eq(user.username, handle.toLowerCase()), eq(user.id, handle)))
    .limit(1);
  return found ?? null;
}

export async function getUserList(userId: string, status?: ListStatus) {
  return db
    .select()
    .from(animeListEntry)
    .where(status ? and(eq(animeListEntry.userId, userId), eq(animeListEntry.status, status)) : eq(animeListEntry.userId, userId))
    .orderBy(desc(animeListEntry.updatedAt));
}

export async function getListStats(userId: string) {
  const rows = await db
    .select({
      status: animeListEntry.status,
      count: count(),
      episodes: sql<number>`coalesce(sum(${animeListEntry.episodes}), 0)::int`,
      scoreSum: sql<number>`coalesce(sum(${animeListEntry.score}), 0)::int`,
      scored: sql<number>`count(${animeListEntry.score})::int`,
    })
    .from(animeListEntry)
    .where(eq(animeListEntry.userId, userId))
    .groupBy(animeListEntry.status);
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.count])) as Partial<Record<ListStatus, number>>;
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const episodes = rows.reduce((sum, r) => sum + r.episodes, 0);
  const scored = rows.reduce((sum, r) => sum + r.scored, 0);
  const meanScore = scored ? rows.reduce((sum, r) => sum + r.scoreSum, 0) / scored : null;
  return { byStatus, total, episodes, meanScore };
}

/** Events per UTC day over the last `days` days, for the activity heatmap. */
export async function getActivity(userId: string, days = 7 * 26) {
  const since = new Date(Date.now() - days * 86_400_000);
  return db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${listEvent.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(listEvent)
    .where(and(eq(listEvent.userId, userId), gte(listEvent.createdAt, since)))
    .groupBy(sql`1`);
}

export async function getRecentEvents(userId: string, limit = 12) {
  return db
    .select()
    .from(listEvent)
    .where(eq(listEvent.userId, userId))
    .orderBy(desc(listEvent.createdAt))
    .limit(limit);
}
