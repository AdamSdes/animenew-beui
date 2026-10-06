import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getListEntry } from "@/lib/list";

export async function GET(_request: Request, { params }: RouteContext<"/api/list/[animeId]">) {
  const { animeId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ entry: null, signedIn: false });
  const entry = /^\d+$/.test(animeId) ? await getListEntry(session.user.id, animeId) : null;
  return NextResponse.json({ entry, signedIn: true }, { headers: { "Cache-Control": "private, no-store" } });
}
