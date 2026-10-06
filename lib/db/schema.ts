import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth core tables (+ username plugin and our additional user fields).
// Keep property names as Better Auth expects them.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  role: text("role").default("user"),
  bio: text("bio"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ---------------------------------------------------------------------------
// App tables. Anime ids are Shikimori ids, stored as text.
// ---------------------------------------------------------------------------

export const listStatus = pgEnum("list_status", [
  "planned",
  "watching",
  "rewatching",
  "completed",
  "on_hold",
  "dropped",
]);

/** One row per (user, anime): the user's list entry. Title fields are a snapshot
 * taken when the entry is saved, so profile lists render without API calls. */
export const animeListEntry = pgTable(
  "anime_list_entry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animeId: text("anime_id").notNull(),
    status: listStatus("status").notNull(),
    score: smallint("score"),
    episodes: integer("episodes").default(0).notNull(),
    animeName: text("anime_name").notNull(),
    animeRussian: text("anime_russian"),
    animePoster: text("anime_poster"),
    animeKind: text("anime_kind"),
    animeEpisodes: integer("anime_episodes"),
    animeYear: integer("anime_year"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("anime_list_entry_user_anime_idx").on(table.userId, table.animeId),
    index("anime_list_entry_user_status_idx").on(table.userId, table.status),
  ],
);

/** Append-only history of list changes — drives the profile activity heatmap. */
export const listEvent = pgTable(
  "list_event",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animeId: text("anime_id").notNull(),
    animeTitle: text("anime_title").notNull(),
    status: listStatus("status"),
    episodes: integer("episodes"),
    score: smallint("score"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("list_event_user_created_idx").on(table.userId, table.createdAt)],
);

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    animeId: text("anime_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Top-level comment this one replies to. Replies are one level deep. */
    parentId: uuid("parent_id").references((): AnyPgColumn => comment.id, { onDelete: "cascade" }),
    /** User being answered inside a thread, for the "@name" prefix. */
    replyToUserId: text("reply_to_user_id").references(() => user.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    isSpoiler: boolean("is_spoiler").default(false).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    repliesCount: integer("replies_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("comment_anime_root_idx")
      .on(table.animeId, table.createdAt)
      .where(sql`${table.parentId} is null`),
    index("comment_parent_idx").on(table.parentId, table.createdAt),
    index("comment_user_idx").on(table.userId, table.createdAt),
  ],
);

export const commentLike = pgTable(
  "comment_like",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.commentId, table.userId] })],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  listEntries: many(animeListEntry),
  comments: many(comment),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const animeListEntryRelations = relations(animeListEntry, ({ one }) => ({
  user: one(user, { fields: [animeListEntry.userId], references: [user.id] }),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  user: one(user, { fields: [comment.userId], references: [user.id] }),
  parent: one(comment, { fields: [comment.parentId], references: [comment.id], relationName: "replies" }),
  replies: many(comment, { relationName: "replies" }),
  likes: many(commentLike),
}));

export const commentLikeRelations = relations(commentLike, ({ one }) => ({
  comment: one(comment, { fields: [commentLike.commentId], references: [comment.id] }),
  user: one(user, { fields: [commentLike.userId], references: [user.id] }),
}));

export type ListStatus = (typeof listStatus.enumValues)[number];
