"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { COMMENT_MAX_LENGTH, getComment, secondsSinceLastComment } from "@/lib/comments";
import { db } from "@/lib/db";
import { comment, commentLike } from "@/lib/db/schema";

const MIN_INTERVAL_SECONDS = 10;

const CreateInput = z.object({
  animeId: z.string().regex(/^\d+$/),
  body: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
  isSpoiler: z.boolean(),
  /** The comment being answered — a root or a reply inside its thread. */
  replyToId: z.uuid().optional(),
});

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

export async function createComment(input: z.infer<typeof CreateInput>): Promise<Result<{ id: string; parentId: string | null }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Войдите, чтобы комментировать" };
  const parsed = CreateInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: `Комментарий должен быть от 1 до ${COMMENT_MAX_LENGTH} символов` };
  }
  const { animeId, body, isSpoiler, replyToId } = parsed.data;

  const since = await secondsSinceLastComment(session.user.id);
  if (since !== null && since < MIN_INTERVAL_SECONDS) {
    return { ok: false, error: "Слишком часто. Подождите несколько секунд" };
  }

  let parentId: string | null = null;
  let replyToUserId: string | null = null;
  if (replyToId) {
    const target = await getComment(replyToId);
    if (!target || target.animeId !== animeId || target.deletedAt) {
      return { ok: false, error: "Комментарий, на который вы отвечаете, не найден" };
    }
    // Threads are one level deep: replies to a reply attach to its root.
    parentId = target.parentId ?? target.id;
    replyToUserId = target.parentId ? target.userId : null;
  }

  const id = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(comment)
      .values({ animeId, userId: session.user.id, body, isSpoiler, parentId, replyToUserId })
      .returning({ id: comment.id });
    if (parentId) {
      await tx
        .update(comment)
        .set({ repliesCount: sql`${comment.repliesCount} + 1` })
        .where(eq(comment.id, parentId));
    }
    return created.id;
  });
  return { ok: true, data: { id, parentId } };
}

export async function toggleCommentLike(commentId: string): Promise<Result<{ liked: boolean; likesCount: number }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Войдите, чтобы ставить лайки" };
  if (!z.uuid().safeParse(commentId).success) return { ok: false, error: "Некорректные данные" };

  return db.transaction(async (tx) => {
    const removed = await tx
      .delete(commentLike)
      .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, session.user.id)))
      .returning({ commentId: commentLike.commentId });
    const liked = removed.length === 0;
    if (liked) {
      const inserted = await tx
        .insert(commentLike)
        .values({ commentId, userId: session.user.id })
        .onConflictDoNothing()
        .returning({ commentId: commentLike.commentId });
      if (!inserted.length) return { ok: false as const, error: "Комментарий не найден" };
    }
    const [updated] = await tx
      .update(comment)
      .set({ likesCount: sql`greatest(${comment.likesCount} + ${liked ? 1 : -1}, 0)` })
      .where(eq(comment.id, commentId))
      .returning({ likesCount: comment.likesCount });
    if (!updated) return { ok: false as const, error: "Комментарий не найден" };
    return { ok: true as const, data: { liked, likesCount: updated.likesCount } };
  });
}

export async function deleteComment(commentId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Нужно войти" };
  if (!z.uuid().safeParse(commentId).success) return { ok: false, error: "Некорректные данные" };
  const target = await getComment(commentId);
  if (!target || target.deletedAt) return { ok: false, error: "Комментарий не найден" };
  const isAdmin = session.user.role === "admin";
  if (target.userId !== session.user.id && !isAdmin) return { ok: false, error: "Нельзя удалить чужой комментарий" };

  await db.transaction(async (tx) => {
    if (target.parentId === null && target.repliesCount > 0) {
      // Keep the root as a tombstone so its thread stays readable.
      await tx.update(comment).set({ deletedAt: new Date(), body: "" }).where(eq(comment.id, target.id));
      return;
    }
    await tx.delete(comment).where(eq(comment.id, target.id));
    if (target.parentId) {
      await tx
        .update(comment)
        .set({ repliesCount: sql`greatest(${comment.repliesCount} - 1, 0)` })
        .where(eq(comment.id, target.parentId));
    }
  });
  return { ok: true, data: null };
}
