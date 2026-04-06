export interface AgentMeta {
  id: string;
  name: string;
  description: string;
  owner: string;
  email: string;
  created: string;
  updated: string;
  version: number;
  excluded: boolean;
}

export interface AgentWithContent {
  meta: AgentMeta;
  refinedPrompt: string;
}

export type ModelType = "gemini" | "claude";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ApiKeys {
  claudeKey: string;
  geminiKey: string;
}
