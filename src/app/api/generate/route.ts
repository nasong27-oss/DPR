import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, apiKey } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "No API key" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: key });

  const today = new Date().toISOString().split("T")[0];
  const authorName = session.user.name || "Unknown";

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `아래 리서치 내용을 다음 마크다운 형식으로 정리해주세요. 각 섹션의 내용은 입력 내용을 기반으로 작성하고, 없는 내용은 "미정" 으로 표기하세요.

형식:
**[리서치 주제]**: (주제 한 줄)
**[날짜]**: ${today}
**[작성자]**: ${authorName}
**[핵심 발견]**: (bullet points로 3~5개)
**[미해결 고민]**: (bullet points로 1~3개)
**[관련 키워드]**: (쉼표로 구분된 키워드 5개 이내)

리서치 내용:
${content}`,
      },
    ],
  });

  const result =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ result });
}
