export interface ModelDef {
  id: string;
  label: string;
  cost: "저가" | "중가" | "고가";
  provider: "gemini" | "claude";
  description: string;
}

export const MODELS: ModelDef[] = [
  // ── Gemini 2.5 시리즈 (안정화) ──────────────────────────────────
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    cost: "저가",
    provider: "gemini",
    description: "범용 고속 작업용 표준 모델",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    cost: "고가",
    provider: "gemini",
    description: "긴 컨텍스트 창(1M+ 토큰) 지원, 안정적인 성능",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    cost: "저가",
    provider: "gemini",
    description: "경량화된 처리용 (가장 저렴)",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    cost: "저가",
    provider: "gemini",
    description: "안정적인 범용 모델",
  },
  // ── Claude ───────────────────────────────────────────────────────
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    cost: "저가",
    provider: "claude",
    description: "가장 빠른 응답 속도",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    cost: "중가",
    provider: "claude",
    description: "속도와 성능의 균형",
  },
  {
    id: "claude-opus-4-6",
    label: "Claude Opus 4.6",
    cost: "고가",
    provider: "claude",
    description: "최고 성능",
  },
];

export function getAvailableModels(hasClaude: boolean, hasGemini: boolean): ModelDef[] {
  return MODELS.filter(
    (m) =>
      (m.provider === "gemini" && hasGemini) ||
      (m.provider === "claude" && hasClaude)
  );
}

export function getDefaultModelId(hasClaude: boolean, hasGemini: boolean): string {
  if (hasGemini) return "gemini-2.5-flash";
  if (hasClaude) return "claude-sonnet-4-6";
  return "";
}

export function getProviderFromModelId(modelId: string): "gemini" | "claude" | null {
  const model = MODELS.find((m) => m.id === modelId);
  return model?.provider ?? null;
}
