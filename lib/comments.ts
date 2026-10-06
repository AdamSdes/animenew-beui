import "server-only";
import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { comment, commentLike, user } from "@/lib/db/schema";

import type { CommentSort, CommentView } from "./comment-types";

export { COMMENT_MAX_LENGTH, type CommentSort, type CommentView } from "./comment-types";

export const COMMENTS_PAGE_SIZE = 20;

const replyTarget = alias(user, "reply_target");

type Viewer = { id: string; role?: string | null } | null;

async function hydrate(rows: Awaited<ReturnType<typeof baseQuery>>, viewer: Viewer): Promise<CommentView[]> {
  const ids = rows.map((r) => r.comment.id);
  const liked = new Set<string>();
  if (viewer && ids.length) {
    const likes = await db
      .select({ commentId: commentLike.commentId })
      .from(commentLike)
      .where(and(eq(commentLike.userId, viewer.id), inArray(commentLike.commentId, ids)));
    for (const like of likes) liked.add(like.commentId);
  }
  return rows.map(({ comment: c, author, replyTo }) => {
    const deleted = c.deletedAt !== null;
    return {
      id: c.id,
      parentId: c.parentId,
      body: deleted ? "" : c.body,
      isSpoiler: c.isSpoiler,
      likesCount: c.likesCount,
      repliesCount: c.repliesCount,
      createdAt: c.createdAt.toISOString(),
      editedAt: c.editedAt?.toISOString() ?? null,
      deleted,
      likedByMe: liked.has(c.id),
      canDelete: !deleted && !!viewer && (viewer.id === c.userId || viewer.role === "admin"),
      author: { id: author.id, name: author.name, username: author.username, image: author.image },
      replyTo: replyTo?.name ? { name: replyTo.name, username: replyTo.username } : null,
    };
  });
}

function baseQuery() {
  return db
    .select({
      comment,
      author: { id: user.id, name: user.name, username: user.username, image: user.image },
      replyTo: { name: replyTarget.name, username: replyTarget.username },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .leftJoin(replyTarget, eq(comment.replyToUserId, replyTarget.id))
    .$dynamic();
}

export async function listRootComments(animeId: string, sort: CommentSort, page: number, viewer: Viewer) {
  const rows = await baseQuery()
    .where(and(eq(comment.animeId, animeId), isNull(comment.parentId)))
    .orderBy(...(sort === "top" ? [desc(comment.likesCount), desc(comment.createdAt)] : [desc(comment.createdAt)]))
    .limit(COMMENTS_PAGE_SIZE + 1)
    .offset((page - 1) * COMMENTS_PAGE_SIZE);
  const hasMore = rows.length > COMMENTS_PAGE_SIZE;
  const items = await hydrate(rows.slice(0, COMMENTS_PAGE_SIZE), viewer);
  // Deleted roots stay only as long as they hold a thread together.
  return { items: items.filter((c) => !c.deleted || c.repliesCount > 0), hasMore };
}

export async function listReplies(parentId: string, viewer: Viewer) {
  const rows = await baseQuery().where(eq(comment.parentId, parentId)).orderBy(asc(comment.createdAt)).limit(500);
  return hydrate(rows, viewer);
}

export async function countComments(animeId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(comment)
    .where(and(eq(comment.animeId, animeId), isNull(comment.deletedAt)));
  return row?.value ?? 0;
}

export async function getComment(id: string) {
  const [row] = await db.select().from(comment).where(eq(comment.id, id)).limit(1);
  return row ?? null;
}

/** Seconds since the user's last comment, or null if they never commented. */
export async function secondsSinceLastComment(userId: string) {
  const [row] = await db
    .select({ seconds: sql<number>`extract(epoch from (now() - max(${comment.createdAt})))::float` })
    .from(comment)
    .where(eq(comment.userId, userId));
  return row?.seconds ?? null;
}
