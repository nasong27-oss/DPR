import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { messages, systemPrompt, model, geminiKey, claudeKey } = await req.json();
  if (!messages?.length) return new Response("No messages", { status: 400 });
  if (!geminiKey && !claudeKey) return new Response("API key required", { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
        );
      };
      const done = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };
      const error = (msg: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      };

      try {
        const useGemini = model === "gemini" || (!model && !!geminiKey);

        if (useGemini && geminiKey) {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(geminiKey);
          const geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt || undefined,
          });

          // Convert messages to Gemini format
          const history = messages.slice(0, -1).map((m: ChatMessage) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const lastMsg = messages[messages.length - 1];
          const chat = geminiModel.startChat({ history });
          const result = await chat.sendMessageStream(lastMsg.content);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) send(text);
          }
          done();
        } else if (claudeKey) {
          const Anthropic = (await import("@anthropic-ai/sdk")).default;
          const anthropic = new Anthropic({ apiKey: claudeKey });

          const s = await anthropic.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 2048,
            system: systemPrompt || undefined,
            messages: messages.map((m: ChatMessage) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const chunk of s) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              send(chunk.delta.text);
            }
          }
          done();
        } else {
          error("사용 가능한 API 키가 없습니다.");
        }
      } catch (err) {
        error(err instanceof Error ? err.message : "오류가 발생했습니다.");
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
