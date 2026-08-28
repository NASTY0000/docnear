import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMessages, sendMessage } from "@/lib/consults";
import { errorMessage, errorStatus } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { id } = await ctx.params;
    const messages = await listMessages(session, id);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: errorStatus(err) });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const message = await sendMessage(session, id, String(body.body || ""));
    return NextResponse.json({ message });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: errorStatus(err) });
  }
}
