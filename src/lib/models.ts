export interface ModelDef {
  id: string;
  label: string;
  cost: "저가" | "중가" | "고가";
  provider: "gemini" | "claude";
}

export const MODELS: ModelDef[] = [
  // Gemini — 모든 모델에 Google Search 웹 검색 그라운딩 적용됨
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", cost: "저가", provider: "gemini" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", cost: "고가", provider: "gemini" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", cost: "저가", provider: "gemini" },
  // Claude
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", cost: "저가", provider: "claude" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", cost: "중가", provider: "claude" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6", cost: "고가", provider: "claude" },
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
