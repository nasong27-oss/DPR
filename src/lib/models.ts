export interface ModelDef {
  id: string;
  label: string;
  cost: "저가" | "중가" | "고가";
  provider: "gemini" | "claude";
  description: string;
}

export const MODELS: ModelDef[] = [
  // ── Gemini 3.1 시리즈 (최신 프리뷰) ─────────────────────────────
  {
    id: "gemini-3.1-ultra",
    label: "Gemini 3.1 Ultra",
    cost: "고가",
    provider: "gemini",
    description: "대규모 복잡한 프로젝트를 위한 하이엔드 모델",
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    cost: "고가",
    provider: "gemini",
    description: "최고 수준의 복합 추론 및 코딩 능력 (94.3% GPQA)",
  },
  {
    id: "gemini-3.1-flash-preview",
    label: "Gemini 3.1 Flash",
    cost: "중가",
    provider: "gemini",
    description: "실시간 반응 속도와 높은 처리량에 최적화",
  },
  {
    id: "gemini-3.1-flash-lite-preview",
    label: "Gemini 3.1 Flash-Lite",
    cost: "저가",
    provider: "gemini",
    description: "극도의 비용 효율성 및 초저지연 (가장 저렴)",
  },
  // ── Gemini 2.5 시리즈 (안정화) ──────────────────────────────────
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    cost: "고가",
    provider: "gemini",
    description: "긴 컨텍스트 창(1M+ 토큰) 지원, 안정적인 성능",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    cost: "저가",
    provider: "gemini",
    description: "범용 고속 작업용 표준 모델",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    cost: "저가",
    provider: "gemini",
    description: "경량화된 처리용",
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
  if (hasGemini) return "gemini-3.1-flash-preview";
  if (hasClaude) return "claude-sonnet-4-6";
  return "";
}

export function getProviderFromModelId(modelId: string): "gemini" | "claude" | null {
  const model = MODELS.find((m) => m.id === modelId);
  return model?.provider ?? null;
}
