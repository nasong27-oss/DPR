import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ghGetFile, ghPutFile } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId, feedback } = await req.json();
  if (!agentId || !feedback?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const feedbackPath = `registry/${agentId}/feedback.md`;
  const today = new Date().toISOString().split("T")[0];

  const newEntry = `\n---\n[날짜]: ${today}\n[피드백]: ${feedback.trim()}\n---\n`;

  const existing = await ghGetFile(feedbackPath);
  const updatedContent = (existing?.content || "") + newEntry;

  // No author info - anonymous
  const author = { name: "Anonymous", email: "anonymous@pm-hub.com" };

  await ghPutFile(
    feedbackPath,
    updatedContent,
    `feedback: anonymous feedback for ${agentId}`,
    author,
    existing?.sha
  );

  return NextResponse.json({ success: true });
}
