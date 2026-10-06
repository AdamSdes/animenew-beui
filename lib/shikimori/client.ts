import "server-only";

// Low-level Shikimori transport: identifies the app with a User-Agent (the API
// rejects anonymous clients), keeps under the published limits of 5 requests
// per second and 90 per minute, and lets Next cache responses.

export const SHIKIMORI_URL = (process.env.SHIKIMORI_URL ?? "https://shikimori.one").replace(/\/$/, "");
const USER_AGENT = process.env.SHIKIMORI_USER_AGENT ?? "animenew";

export const isShikimoriMock = process.env.SHIKIMORI_MOCK === "1";

const PER_SECOND = 5;
const PER_MINUTE = 90;
const sent: number[] = [];
let queue: Promise<void> = Promise.resolve();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Waits for a free slot in both windows. Calls are serialised through `queue`. */
function acquireSlot(): Promise<void> {
  const next = queue.then(async () => {
    for (;;) {
      const now = Date.now();
      while (sent.length && now - sent[0] >= 60_000) sent.shift();
      const lastSecond = sent.filter((t) => now - t < 1000);
      if (sent.length < PER_MINUTE && lastSecond.length < PER_SECOND) {
        sent.push(now);
        return;
      }
      const waitMinute = sent.length >= PER_MINUTE ? 60_000 - (now - sent[0]) : 0;
      const waitSecond = lastSecond.length >= PER_SECOND ? 1000 - (now - lastSecond[0]) : 0;
      await sleep(Math.max(waitMinute, waitSecond, 10));
    }
  });
  queue = next.catch(() => {});
  return next;
}

export class ShikimoriError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ShikimoriError";
  }
}

type CacheOptions = {
  /** Seconds before Next revalidates the cached response. */
  revalidate?: number;
  tags?: string[];
};

async function request(path: string, init: RequestInit, cache: CacheOptions): Promise<Response> {
  const url = `${SHIKIMORI_URL}${path}`;
  for (let attempt = 0; ; attempt++) {
    await acquireSlot();
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...init.headers,
      },
      cache: "force-cache",
      next: { revalidate: cache.revalidate ?? 3600, tags: cache.tags },
    });
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1));
      continue;
    }
    if (!response.ok) {
      throw new ShikimoriError(`Shikimori ${init.method ?? "GET"} ${path} → ${response.status}`, response.status);
    }
    return response;
  }
}

export async function shikiGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  cache: CacheOptions = {},
): Promise<T> {
  const response = await request(
    "/api/graphql",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    },
    cache,
  );
  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) {
    throw new ShikimoriError(payload.errors.map((e) => e.message).join("; "));
  }
  if (!payload.data) throw new ShikimoriError("Shikimori GraphQL returned no data");
  return payload.data;
}

export async function shikiRest<T>(path: string, cache: CacheOptions = {}): Promise<T> {
  const response = await request(path, { method: "GET" }, cache);
  return (await response.json()) as T;
}

/** REST payloads carry site-relative image paths; GraphQL ones are absolute. */
export function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${SHIKIMORI_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
