import { type NextRequest, NextResponse } from "next/server";
import { filtersToApi, parseCatalogFilters } from "@/lib/catalog";
import { PAGE_SIZE, searchAnimes } from "@/lib/shikimori/api";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), 200);
  try {
    const items = await searchAnimes({ ...filtersToApi(parseCatalogFilters(params), page), limit: PAGE_SIZE });
    return NextResponse.json(items, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "Shikimori недоступен" }, { status: 502 });
  }
}
