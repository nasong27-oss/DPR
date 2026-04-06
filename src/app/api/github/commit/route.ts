import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ghPutFileSafe } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { path, content, message } = await req.json();
  if (!path || content == null || !message)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const author = {
    name: session.user.name || "PM Team",
    email: session.user.email || "pm@team.com",
  };

  try {
    await ghPutFileSafe(path, content, message, author);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Commit failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
