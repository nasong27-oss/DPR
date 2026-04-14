import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getKeysFromCookie } from "@/lib/getKeysFromCookie";
import { getProviderFromModelId } from "@/lib/models";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { messages, systemPrompt, modelId, webSearch } = await req.json();
  if (!messages?.length) return new Response("No messages", { status: 400 });

  const keys = await getKeysFromCookie(session.user.email);
  const claudeKey = keys?.claudeKey || "";
  const geminiKey = keys?.geminiKey || "";

  if (!geminiKey && !claudeKey)
    return new Response("API key required", { status: 400 });

  // Determine provider from modelId, fallback to available key
  const provider = getProviderFromModelId(modelId) ?? (geminiKey ? "gemini" : "claude");
  const useGemini = provider === "gemini" && !!geminiKey;

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
        if (useGemini) {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(geminiKey);
          const geminiModel = genAI.getGenerativeModel({
            model: modelId || "gemini-2.5-flash",
            systemInstruction: systemPrompt || undefined,
            // Gemini 2.0+ uses googleSearch (not googleSearchRetrieval)
            // @ts-expect-error googleSearch not in SDK 0.24.x types yet
            tools: [{ googleSearch: {} }],
          });

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

          // Keep last 20 messages to prevent unbounded cost growth
          const recent = (messages as ChatMessage[]).slice(-20);
          const firstUser = recent.findIndex((m) => m.role === "user");
          const trimmed = firstUser > 0 ? recent.slice(firstUser) : recent;

          // When web search is on, prepend efficiency instructions to constrain
          // Claude's search behavior. Each search result can be 100k+ tokens,
          // so unconstrained searches lead to $2-3/query costs.
          const WEB_SEARCH_GUIDE = `[웹 검색 효율 지침 — 반드시 준수]
- 검색은 최대 1~2회. 유사·중복 키워드로 반복 검색 금지.
- 검색어는 핵심 키워드 1개로 간결하게 작성 (예: "테슬라 주가 2025-04").
- 첫 검색 결과에서 충분한 정보를 얻었으면 즉시 답변 작성, 추가 검색 중지.
- 검색 결과 중 질문과 직접 관련된 사실만 인용. 무관한 내용은 무시.
- 이미 알고 있는 내용이면 검색 없이 바로 답변.`;

          const useWebSearch = webSearch && modelId !== "claude-haiku-4-5-20251001";
          const effectiveSystem = useWebSearch
            ? (systemPrompt ? `${WEB_SEARCH_GUIDE}\n\n${systemPrompt}` : WEB_SEARCH_GUIDE)
            : systemPrompt;

          const s = await anthropic.messages.stream({
            model: modelId || "claude-sonnet-4-6",
            max_tokens: 8192,
            // Cache effective system prompt — 10x cheaper on repeat turns
            system: effectiveSystem
              ? [{ type: "text" as const, text: effectiveSystem, cache_control: { type: "ephemeral" as const } }]
              : undefined,
            // max_uses: 3 as hard cap alongside the prompt instruction
            ...(useWebSearch
              ? { tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }] }
              : {}),
            messages: trimmed.map((m: ChatMessage) => ({
              role: m.role,
              content: m.content,
            })),
          });

          const sendStatus = (status: string) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status })}\n\n`)
            );
          };

          for await (const chunk of s) {
            if (chunk.type === "content_block_start") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if ((chunk as any).content_block?.type === "server_tool_use") {
                sendStatus("searching");
              }
            } else if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              send(chunk.delta.text);
            } else if (
              chunk.type === "message_delta" &&
              chunk.delta.stop_reason === "max_tokens"
            ) {
              send("\n\n*(응답이 최대 길이에 도달해 잘렸습니다. 이어서 작성해 달라고 요청해 주세요.)*");
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
