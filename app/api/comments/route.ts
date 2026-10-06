import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { type CommentSort, countComments, listRootComments } from "@/lib/comments";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const animeId = params.get("animeId") ?? "";
  if (!/^\d+$/.test(animeId)) return NextResponse.json({ error: "animeId required" }, { status: 400 });
  const sort: CommentSort = params.get("sort") === "top" ? "top" : "new";
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), 500);
  const session = await getSession();
  const viewer = session ? { id: session.user.id, role: session.user.role } : null;
  const [{ items, hasMore }, total] = await Promise.all([
    listRootComments(animeId, sort, page, viewer),
    page === 1 ? countComments(animeId) : Promise.resolve(null),
  ]);
  return NextResponse.json({ items, hasMore, total }, { headers: { "Cache-Control": "private, no-store" } });
}
