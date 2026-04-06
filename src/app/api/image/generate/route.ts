import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function formatGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("API_KEY_INVALID") || msg.includes("invalid api key"))
    return "API 키가 유효하지 않습니다. Google AI Studio에서 키를 확인해주세요.";
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota"))
    return "무료 사용량 한도를 초과했습니다. 내일 다시 시도하거나 유료 플랜으로 업그레이드하세요. (aistudio.google.com에서 확인 가능)";
  if (msg.includes("SAFETY") || msg.includes("PROHIBITED") || msg.includes("policy"))
    return "요청한 이미지가 Google 콘텐츠 정책에 위반됩니다. 프롬프트를 수정해주세요.";
  if (msg.includes("403") || msg.includes("PERMISSION") || msg.includes("not supported"))
    return "현재 API 키 등급에서 지원하지 않는 기능입니다. Gemini API 플랜을 확인해주세요.";
  if (msg.includes("ECONNRESET") || msg.includes("fetch") || msg.includes("network"))
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인 후 다시 시도해주세요.";
  return `오류가 발생했습니다: ${msg}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, geminiKey } = await req.json();
  if (!geminiKey) return NextResponse.json({ error: "Gemini API 키가 필요합니다." }, { status: 400 });
  if (!prompt) return NextResponse.json({ error: "프롬프트를 입력해주세요." }, { status: 400 });

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(geminiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // @ts-expect-error responseModalities not in types yet
      generationConfig: { responseModalities: ["image", "text"] },
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      // @ts-ignore
      (p) => p.inlineData
    ) as { inlineData: { data: string; mimeType: string } } | undefined;

    if (!imagePart) {
      return NextResponse.json(
        { error: "이미지를 생성하지 못했습니다. 프롬프트를 수정해보세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    });
  } catch (err) {
    return NextResponse.json({ error: formatGeminiError(err) }, { status: 500 });
  }
}
