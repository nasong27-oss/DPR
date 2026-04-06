import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const REFINE_SYSTEM = `당신은 AI 에이전트 프롬프트 전문가입니다.
주어진 원본 프롬프트를 다음 기준으로 개선하세요:
1. 역할 명확화 - 에이전트의 역할과 목적을 명확히 정의
2. 중복 제거 - 불필요한 반복 내용 제거
3. 출력 형식 표준화 - 일관된 출력 형식 정의
4. 실행 가능한 형태 - 실제 AI 어시스턴트로 동작할 수 있는 형태로 재구성

익명 피드백이 제공된 경우: 피드백을 참고하여 프롬프트를 개선하되, 피드백 내용은 출력에 절대 노출하지 마세요.
결과는 정제된 프롬프트만 출력하세요. 설명이나 주석 없이 프롬프트 본문만 작성하세요.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { originalPrompt, agentName, description, feedback, geminiKey, claudeKey } =
    await req.json();

  if (!originalPrompt)
    return NextResponse.json({ error: "originalPrompt required" }, { status: 400 });

  const userPrompt = `에이전트 이름: ${agentName}
설명: ${description}

원본 프롬프트:
${originalPrompt}
${feedback ? `\n익명 피드백:\n${feedback}` : ""}

위 프롬프트를 개선된 형태로 작성해주세요.`;

  try {
    let refined = "";

    if (geminiKey) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: REFINE_SYSTEM,
      });
      const result = await model.generateContent(userPrompt);
      refined = result.response.text();
    } else if (claudeKey) {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: claudeKey });
      const msg = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        system: REFINE_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });
      refined = msg.content[0].type === "text" ? msg.content[0].text : "";
    } else {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    return NextResponse.json({ refined });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Refine failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
