"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ModelType, ChatMessage } from "@/types";
import ImageMode from "./ImageMode";
import FeedbackSection from "./FeedbackSection";

interface Props {
  agentId?: string; // undefined = master
  agentName: string;
  agentDescription?: string;
  agentOwner?: string;
  systemPrompt: string;
  claudeKey: string;
  geminiKey: string;
  selectedModel: ModelType;
  onModelChange: (m: ModelType) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

type SubTab = "chat" | "image";

export default function AgentChat({
  agentId,
  agentName,
  agentDescription,
  agentOwner,
  systemPrompt,
  claudeKey,
  geminiKey,
  selectedModel,
  onModelChange,
  isOwner,
  onEdit,
  onDelete,
}: Props) {
  const { data: session } = useSession();
  const [subTab, setSubTab] = useState<SubTab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const bothKeys = !!(claudeKey && geminiKey);
  const hasAnyKey = !!(claudeKey || geminiKey);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !hasAnyKey) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt,
          model: selectedModel,
          geminiKey,
          claudeKey,
        }),
      });

      if (!res.ok) throw new Error("응답 오류");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: fullText };
                return copy;
              });
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveConversation = async () => {
    if (!messages.length) return;
    setSaving(true);

    const today = new Date().toISOString().split("T")[0];
    const firstQ = messages.find((m) => m.role === "user")?.content || "대화";
    const topic = firstQ
      .slice(0, 40)
      .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const path = `outputs/QA-${agentName}-${today}-${topic}.md`;
    const content = [
      `# QA 대화 — ${agentName} (${today})`,
      `작성자: ${session?.user?.name}`,
      "",
      "---",
      "",
      ...messages.map((m) => `### ${m.role === "user" ? "Q" : "A"}\n\n${m.content}`),
    ].join("\n\n");

    const res = await fetch("/api/github/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        content,
        message: `docs: QA 대화 저장 [${agentName}] (by ${session?.user?.name})`,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
    setSaving(false);
  };

  return (
    <div>
      {/* Agent header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{agentName}</h2>
          {agentDescription && (
            <p className="text-sm text-gray-500 mt-0.5">{agentDescription}</p>
          )}
          {agentOwner && (
            <p className="text-xs text-gray-400 mt-1">등록자: {agentOwner}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        <button
          onClick={() => setSubTab("chat")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          💬 대화
        </button>
        <button
          onClick={() => setSubTab("image")}
          title={!geminiKey ? "Gemini API 키 필요" : undefined}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
            subTab === "image"
              ? "bg-white text-gray-900 shadow-sm"
              : geminiKey
              ? "text-gray-500 hover:text-gray-700"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          🖼️ 이미지
          {!geminiKey && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full" />
          )}
        </button>
      </div>

      {subTab === "chat" && (
        <div>
          {/* Model selector + save button */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            {bothKeys ? (
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value as ModelType)}
                className="text-sm border border-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="gemini">✨ Gemini (기본값)</option>
                <option value="claude">🤖 Claude</option>
              </select>
            ) : (
              <span className="text-xs text-gray-500">
                {geminiKey ? "✨ Gemini" : "🤖 Claude"}
              </span>
            )}

            {messages.length > 0 && (
              <button
                onClick={handleSaveConversation}
                disabled={saving || saved}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
              >
                {saved ? "저장 완료!" : saving ? "저장 중..." : "이 대화 저장"}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex flex-col h-[calc(100vh-400px)] min-h-[320px]">
            <div className="flex-1 overflow-y-auto space-y-3 pb-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">
                    {hasAnyKey
                      ? `${agentName}와 대화를 시작하세요`
                      : "API 키를 먼저 설정해주세요"}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && msg.content === "" ? (
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <pre
                        className={`whitespace-pre-wrap font-sans ${
                          loading && i === messages.length - 1 && msg.role === "assistant"
                            ? "streaming-cursor" : ""
                        }`}
                      >
                        {msg.content}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="border-t border-gray-200 pt-3">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasAnyKey ? "메시지를 입력하세요... (Enter 전송, Shift+Enter 줄바꿈)" : "API 키를 먼저 설정해주세요"}
                  disabled={!hasAnyKey}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 max-h-32 disabled:bg-gray-50 disabled:text-gray-400"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim() || !hasAnyKey}
                  className="flex-shrink-0 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  전송
                </button>
              </div>
            </div>
          </div>

          {/* Feedback (not for master) */}
          {agentId && <FeedbackSection agentId={agentId} />}
        </div>
      )}

      {subTab === "image" && (
        <ImageMode
          geminiKey={geminiKey}
          agentId={agentId || "master"}
          onNeedGemini={() => setSubTab("chat")}
        />
      )}
    </div>
  );
}
