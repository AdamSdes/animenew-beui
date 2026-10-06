// Shared between the server queries (lib/comments.ts) and the client UI.

export type CommentSort = "new" | "top";

export type CommentView = {
  id: string;
  parentId: string | null;
  body: string;
  isSpoiler: boolean;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  likedByMe: boolean;
  canDelete: boolean;
  author: { id: string; name: string; username: string | null; image: string | null };
  replyTo: { name: string; username: string | null } | null;
};

export const COMMENT_MAX_LENGTH = 2000;
