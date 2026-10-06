import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { listReplies } from "@/lib/comments";

export async function GET(_request: Request, { params }: RouteContext<"/api/comments/[id]/replies">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const session = await getSession();
  const viewer = session ? { id: session.user.id, role: session.user.role } : null;
  const items = await listReplies(id, viewer);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
}
