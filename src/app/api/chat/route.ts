import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { AGENTS, AgentKey } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { messages, systemContent, agentKey, apiKey } = await req.json();

  if (!apiKey) return new Response("API key required", { status: 400 });
  if (!agentKey || !AGENTS[agentKey as AgentKey]) {
    return new Response("Invalid agent", { status: 400 });
  }

  const agent = AGENTS[agentKey as AgentKey];
  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `당신은 PM팀의 ${agent.name} 전문 어시스턴트입니다.
아래는 우리 팀이 축적한 리서치/산출물/대화 이력입니다.
이 내용을 바탕으로 답하세요.
문서에 없는 내용은 '추가 리서치 필요'로 표시하세요.
출력 형식: 결론(1~2줄) / 근거(문서 기반) / 권고 액션 / 다른 에이전트와 공유할 인사이트(있을 경우)

=== 축적된 지식 ===
${systemContent || "아직 축적된 문서가 없습니다. 일반 PM 지식으로 답변합니다."}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await anthropic.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages,
        });

        for await (const chunk of s) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
