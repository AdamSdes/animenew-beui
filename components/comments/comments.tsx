"use client";

import { type InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EyeOff, Heart, MessageCircle, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { createComment, deleteComment, toggleCommentLike } from "@/app/actions/comments";
import { Button } from "@/components/motion/button";
import { Checkbox } from "@/components/motion/checkbox";
import { Loader } from "@/components/motion/loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Avatar } from "@/components/site/avatar";
import { LinkButton } from "@/components/site/press-link";
import { useToast } from "@/components/site/providers";
import { useSession } from "@/lib/auth-client";
import { COMMENT_MAX_LENGTH as MAX_LENGTH, type CommentSort as Sort, type CommentView } from "@/lib/comment-types";
import { EASE_OUT } from "@/lib/ease";
import { pluralRu } from "@/lib/shikimori/format";
import { cn } from "@/lib/utils";

type RootPage = { items: CommentView[]; hasMore: boolean; total: number | null };
const relative = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" });

function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 60) return "только что";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 30) return relative.format(Math.round(seconds / 86400), "day");
  if (abs < 86400 * 365) return relative.format(Math.round(seconds / (86400 * 30)), "month");
  return relative.format(Math.round(seconds / (86400 * 365)), "year");
}

function profileHref(author: { id: string; username: string | null }) {
  return `/u/${author.username ?? author.id}`;
}

function Composer({
  animeId,
  replyToId,
  placeholder = "Поделитесь мнением…",
  autoFocus,
  onDone,
  onCancel,
}: {
  animeId: string;
  replyToId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onDone: (created: { id: string; parentId: string | null }) => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  // Auto-grow up to a sensible height.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the text changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [body]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = body.trim();
    if (!text || pending) return;
    startTransition(async () => {
      const result = await createComment({ animeId, body: text, isSpoiler: spoiler, replyToId });
      if (!result.ok) {
        showToast({ status: "error", title: result.error });
        return;
      }
      setBody("");
      setSpoiler(false);
      onDone(result.data);
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card/60 p-3 focus-within:border-border-strong">
      <textarea
        ref={ref}
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === "Escape") onCancel?.();
        }}
        rows={2}
        placeholder={placeholder}
        aria-label="Текст комментария"
        className="block w-full resize-none bg-transparent px-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <Checkbox checked={spoiler} onCheckedChange={setSpoiler} label="Спойлер" />
        <div className="flex items-center gap-2">
          <span className={cn("text-xs tabular-nums text-muted-foreground", body.length > MAX_LENGTH * 0.9 && "text-warning")}>
            {body.length ? `${body.length}/${MAX_LENGTH}` : "⌘ + Enter"}
          </span>
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Отмена
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={!body.trim() || pending}>
            {pending ? "Отправляем…" : replyToId ? "Ответить" : "Отправить"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SpoilerBody({ text }: { text: string }) {
  const [shown, setShown] = useState(false);
  if (shown) return <p className="whitespace-pre-wrap break-words">{text}</p>;
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="group relative block w-full overflow-hidden rounded-xl text-left"
      aria-label="Показать спойлер"
    >
      <p className="whitespace-pre-wrap break-words blur-md select-none" aria-hidden="true">
        {text}
      </p>
      <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/30 text-xs font-medium text-foreground">
        <EyeOff className="size-3.5" /> Спойлер — нажмите, чтобы показать
      </span>
    </button>
  );
}

function CommentItem({
  item,
  animeId,
  signedIn,
  onChanged,
}: {
  item: CommentView;
  animeId: string;
  signedIn: boolean;
  onChanged: (created?: { parentId: string | null }) => void;
}) {
  const reduce = useReducedMotion();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(item.likedByMe);
  const [likes, setLikes] = useState(item.likesCount);
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [showReplies, setShowReplies] = useState(false);
  const isRoot = item.parentId === null;

  const replies = useQuery<{ items: CommentView[] }>({
    queryKey: ["comment-replies", item.id],
    queryFn: () => fetch(`/api/comments/${item.id}/replies`).then((r) => r.json()),
    enabled: isRoot && showReplies,
  });

  const like = () => {
    if (!signedIn) {
      showToast({ status: "info", title: "Войдите, чтобы ставить лайки" });
      return;
    }
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    startTransition(async () => {
      const result = await toggleCommentLike(item.id);
      if (result.ok) {
        setLiked(result.data.liked);
        setLikes(result.data.likesCount);
      } else {
        setLiked(liked);
        setLikes(likes);
        showToast({ status: "error", title: result.error });
      }
    });
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      const result = await deleteComment(item.id);
      if (!result.ok) showToast({ status: "error", title: result.error });
      else showToast({ status: "success", title: "Комментарий удалён" });
      onChanged();
    });
  };

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="flex gap-3"
    >
      <Link href={profileHref(item.author)} className="shrink-0" aria-hidden={item.deleted} tabIndex={-1}>
        <Avatar name={item.deleted ? "?" : item.author.name} image={item.deleted ? null : item.author.image} size={isRoot ? 36 : 28} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          {item.deleted ? (
            <span className="text-muted-foreground">Комментарий удалён</span>
          ) : (
            <Link href={profileHref(item.author)} className="font-medium text-foreground hover:text-accent">
              {item.author.name}
            </Link>
          )}
          <time dateTime={item.createdAt} title={absolute.format(new Date(item.createdAt))} className="text-xs text-muted-foreground">
            {timeAgo(item.createdAt)}
          </time>
        </div>

        {!item.deleted ? (
          <div className="mt-1 text-sm leading-relaxed text-foreground/90">
            {item.replyTo ? (
              <Link href={`/u/${item.replyTo.username ?? ""}`} className="mr-1 text-accent">
                @{item.replyTo.username ?? item.replyTo.name}
              </Link>
            ) : null}
            {item.isSpoiler ? <SpoilerBody text={item.body} /> : <p className="inline whitespace-pre-wrap break-words">{item.body}</p>}
          </div>
        ) : null}

        {!item.deleted ? (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={like}
              aria-pressed={liked}
              aria-label={liked ? "Убрать лайк" : "Нравится"}
              className={cn(
                "press inline-flex h-7 items-center gap-1.5 rounded-full px-2 transition-colors hover:bg-muted",
                liked && "text-rose-500",
              )}
            >
              <motion.span key={String(liked)} initial={reduce ? false : { scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                <Heart className={cn("size-3.5", liked && "fill-current")} />
              </motion.span>
              <span className="tabular-nums">{likes || ""}</span>
            </button>
            {signedIn ? (
              <button
                type="button"
                onClick={() => setReplying((v) => !v)}
                className="press inline-flex h-7 items-center gap-1.5 rounded-full px-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Reply className="size-3.5" /> Ответить
              </button>
            ) : null}
            {item.canDelete ? (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className={cn(
                  "press inline-flex h-7 items-center gap-1.5 rounded-full px-2 transition-colors hover:bg-muted",
                  confirmDelete ? "text-destructive" : "hover:text-foreground",
                )}
              >
                <Trash2 className="size-3.5" /> {confirmDelete ? "Точно удалить?" : "Удалить"}
              </button>
            ) : null}
          </div>
        ) : null}

        {replying ? (
          <div className="mt-3">
            <Composer
              animeId={animeId}
              replyToId={item.id}
              autoFocus
              placeholder={`Ответ для ${item.author.name}…`}
              onCancel={() => setReplying(false)}
              onDone={(created) => {
                setReplying(false);
                setShowReplies(true);
                onChanged(created);
              }}
            />
          </div>
        ) : null}

        {isRoot && item.repliesCount > 0 ? (
          <div className="mt-2">
            {!showReplies ? (
              <button
                type="button"
                onClick={() => setShowReplies(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                <MessageCircle className="size-3.5" />
                {item.repliesCount} {pluralRu(item.repliesCount, "ответ", "ответа", "ответов")}
              </button>
            ) : replies.isLoading ? (
              <Loader variant="dots" size={16} label="Загружаем ответы" />
            ) : (
              <ul className="mt-3 space-y-4 border-l border-border pl-4">
                <AnimatePresence initial={false}>
                  {(replies.data?.items ?? []).map((reply) => (
                    <CommentItem key={reply.id} item={reply} animeId={animeId} signedIn={signedIn} onChanged={onChanged} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </motion.li>
  );
}

export function Comments({ animeId }: { animeId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<Sort>("new");
  const key = ["comments", animeId, sort];

  const query = useInfiniteQuery<RootPage, Error, InfiniteData<RootPage>, string[], number>({
    queryKey: key,
    queryFn: ({ pageParam }) => fetch(`/api/comments?animeId=${animeId}&sort=${sort}&page=${pageParam}`).then((r) => r.json()),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
  });

  const total = query.data?.pages[0]?.total ?? 0;
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  const refresh = (created?: { parentId: string | null }) => {
    queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
    if (created?.parentId) queryClient.invalidateQueries({ queryKey: ["comment-replies", created.parentId] });
  };

  return (
    <section aria-labelledby="comments-title" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="comments-title" className="text-xl font-semibold tracking-tight text-foreground">
          Обсуждение{" "}
          {total ? <span className="text-base font-normal text-muted-foreground tabular-nums">{total}</span> : null}
        </h2>
        <Tabs value={sort} onValueChange={(v) => setSort(v as Sort)} variant="segment">
          <TabsList>
            <TabsTrigger value="new" className="px-3 py-1.5 text-xs">
              Новые
            </TabsTrigger>
            <TabsTrigger value="top" className="px-3 py-1.5 text-xs">
              Популярные
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {session ? (
        <div className="flex gap-3">
          <Avatar name={session.user.name} image={session.user.image} size={36} />
          <div className="flex-1">
            <Composer animeId={animeId} onDone={refresh} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center sm:flex-row sm:text-left">
          <p className="flex-1 text-sm text-muted-foreground">Войдите, чтобы участвовать в обсуждении.</p>
          <LinkButton href={`/login?next=/anime/${animeId}`} size="sm">
            Войти
          </LinkButton>
        </div>
      )}

      {query.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader variant="dots" label="Загружаем комментарии" />
        </div>
      ) : items.length ? (
        <ul className="space-y-6">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CommentItem key={item.id} item={item} animeId={animeId} signedIn={!!session} onChanged={refresh} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Пока никто ничего не написал. Будьте первым!</p>
      )}

      {query.hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? "Загружаем…" : "Показать ещё"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
