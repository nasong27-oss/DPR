import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ghPutFile } from "@/lib/github";

const ANON_AUTHOR = { name: "Anonymous", email: "anonymous@pm-hub.com" };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { agentId, question, answer } = await req.json();
  if (!question?.trim() || !answer?.trim()) return NextResponse.json({ ok: false });

  const date = new Date().toISOString().split("T")[0];
  const hash = Math.random().toString(36).slice(2, 8);
  const targetId = agentId || "master";
  const path = `context/${targetId}/learn-${date}-${hash}.md`;

  const content = [
    `# 익명 학습 맥락`,
    ``,
    `날짜: ${date}  에이전트: ${targetId}`,
    ``,
    `## Q`,
    ``,
    question.trim(),
    ``,
    `## A`,
    ``,
    answer.trim(),
  ].join("\n");

  try {
    await ghPutFile(path, content, `context: anonymous learning [${targetId}]`, ANON_AUTHOR);
    return NextResponse.json({ ok: true });
  } catch {
    // 실패해도 대화에 영향 없음
    return NextResponse.json({ ok: false });
  }
}
