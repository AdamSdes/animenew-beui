import { type NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/shikimori/api";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const results = await searchAnimes({ search: q, limit: 8, order: "popularity" });
    return NextResponse.json(results, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
