import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { AGENTS, AgentKey } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, imageBase64, imageType, agentKey, apiKey } = await req.json();

  if (!agentKey || !AGENTS[agentKey as AgentKey]) {
    return NextResponse.json({ error: "Invalid agent" }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  const agent = AGENTS[agentKey as AgentKey];
  const today = new Date().toISOString().split("T")[0];
  const author = session.user.name || "Unknown";

  const anthropic = new Anthropic({ apiKey });

  const formatPrompt = `아래 PM 산출물을 다음 마크다운 형식으로 정리해주세요.
없는 내용은 "미정"으로 표기하되, 있는 내용은 최대한 구체적으로 작성하세요.

\`\`\`
[에이전트]: ${agent.name}
[주제]: (핵심 주제 한 줄)
[날짜]: ${today}
[작성자]: ${author}
[핵심 산출물]: (bullet points, 핵심 내용 3-5개)
[다른 에이전트에게 전달할 인사이트]: (리서치→화면설계, 화면설계→마케팅 등 cross-agent 인사이트)
[관련 키워드]: (쉼표 구분, 5개 이내)
[미해결 고민]: (bullet points, 1-3개)
\`\`\``;

  let messageContent: Anthropic.MessageParam["content"];

  if (imageBase64 && imageType) {
    messageContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: `이 이미지(${agent.name} 에이전트 산출물)를 분석하고 내용을 파악한 뒤 아래 형식으로 구조화해주세요.\n\n${formatPrompt}`,
      },
    ];
  } else {
    messageContent = `다음 ${agent.name} 에이전트 산출물을 분석하고 아래 형식으로 구조화해주세요.\n\n${formatPrompt}\n\n=== 산출물 내용 ===\n${content}`;
  }

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: messageContent }],
  });

  const result = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result });
}
