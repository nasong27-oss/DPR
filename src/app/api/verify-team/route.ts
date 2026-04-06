import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { code } = await req.json();
  if (code === process.env.TEAM_PASSWORD) return NextResponse.json({ success: true });
  return NextResponse.json({ error: "Invalid code" }, { status: 403 });
}
