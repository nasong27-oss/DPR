import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadAllAgents, ghGetFile, ghPutFileSafe } from "@/lib/github";

const MASTER_SYSTEM = `당신은 여러 PM 에이전트 프롬프트를 통합하는 마스터 프롬프트 생성기입니다.
아래 각 에이전트의 프롬프트와 익명 피드백을 분석하여 하나의 통합된 마스터 PM 에이전트 프롬프트를 생성하세요.

마스터 에이전트는:
- 모든 개별 에이전트의 전문성을 통합
- PM 팀 전반의 역량을 대표
- 각 에이전트 영역을 상황에 맞게 활용
- 일관된 출력 형식 유지

피드백은 학습에만 활용하고 출력에 절대 노출하지 마세요.
결과는 통합 마스터 프롬프트 본문만 작성하세요.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { geminiKey, claudeKey } = await req.json();
  if (!geminiKey && !claudeKey)
    return NextResponse.json({ error: "API key required" }, { status: 400 });

  const author = {
    name: session.user.name || "PM Team",
    email: session.user.email || "pm@team.com",
  };

  // Load all non-excluded agents
  const agents = await loadAllAgents();

  if (agents.length === 0) {
    // Empty master prompt
    await ghPutFileSafe(
      "master/master-prompt.md",
      "# 마스터 에이전트\n\n등록된 에이전트가 없습니다.",
      "docs: update master-prompt.md (no agents)",
      author
    );
    return NextResponse.json({ masterPrompt: "" });
  }

  // Load feedback for each agent
  const agentSections = await Promise.all(
    agents.map(async (agent) => {
      const feedbackFile = await ghGetFile(`registry/${agent.meta.id}/feedback.md`);
      const feedback = feedbackFile?.content || "";
      return `## ${agent.meta.name} (${agent.meta.description})\n\n### 프롬프트\n${agent.refinedPrompt}${feedback ? `\n\n### 익명 피드백\n${feedback}` : ""}`;
    })
  );

  const userPrompt = `다음 ${agents.length}개 PM 에이전트 프롬프트를 통합하여 마스터 에이전트 프롬프트를 생성하세요.\n\n${agentSections.join("\n\n---\n\n")}`;

  try {
    let masterPrompt = "";

    if (geminiKey) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: MASTER_SYSTEM,
      });
      const result = await model.generateContent(userPrompt);
      masterPrompt = result.response.text();
    } else {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: claudeKey });
      const msg = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: MASTER_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });
      masterPrompt = msg.content[0].type === "text" ? msg.content[0].text : "";
    }

    await ghPutFileSafe(
      "master/master-prompt.md",
      masterPrompt,
      `docs: regenerate master-prompt.md (${agents.length} agents)`,
      author
    );

    return NextResponse.json({ masterPrompt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Master generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
