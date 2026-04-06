import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, systemContent, apiKey } = await req.json();

  if (!apiKey) {
    return new Response("API key required", { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `당신은 PM팀의 리서치 어시스턴트입니다.
아래 리서치 문서를 바탕으로만 답하세요.
문서에 없는 내용은 '리서치 필요'로 표시하세요.
출력 형식: 결론(1~2줄) / 근거(문서 기반) / 권고 액션

=== 리서치 문서 ===
${systemContent || "리서치 문서가 없습니다."}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await anthropic.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
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
