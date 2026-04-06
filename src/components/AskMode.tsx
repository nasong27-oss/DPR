"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AGENTS, AgentKey } from "@/lib/agents";

interface Message {
  role: "user" | "assistant";
  content: Anthropic.MessageParam["content"];
  displayText: string;
}

// We use a minimal type here to avoid importing Anthropic client-side
namespace Anthropic {
  export interface MessageParam {
    role: "user" | "assistant";
    content:
      | string
      | Array<
          | { type: "text"; text: string }
          | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
        >;
  }
}

interface Props {
  agentKey: AgentKey;
  apiKey: string;
  systemContent: string;
  fileCount: number;
  onNeedApiKey: () => void;
}

export default function AskMode({ agentKey, apiKey, systemContent, fileCount, onNeedApiKey }: Props) {
  const { data: session } = useSession();
  const agent = AGENTS[agentKey];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset on agent change
  useEffect(() => {
    setMessages([]);
    setSaved(false);
    setError("");
  }, [agentKey]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !imageFile) return;
    if (!apiKey) { onNeedApiKey(); return; }
    if (loading) return;

    // Build message content
    let userContent: Anthropic.MessageParam["content"];
    let displayText = text;

    if (imageFile && imagePreview) {
      const base64 = imagePreview.split(",")[1];
      const parts: Array<{ type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } }> = [];
      if (text) parts.push({ type: "text", text });
      parts.push({
        type: "image",
        source: { type: "base64", media_type: imageFile.type, data: base64 },
      });
      userContent = parts;
      displayText = text ? `${text}\n[이미지 첨부]` : "[이미지 첨부]";
    } else {
      userContent = text;
    }

    const newMsg: Message = { role: "user", content: userContent, displayText };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setImageFile(null);
    setImagePreview("");
    setLoading(true);
    setError("");

    const assistantMsg: Message = { role: "assistant", content: "", displayText: "" };
    setMessages([...updatedMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          systemContent,
          agentKey,
          apiKey,
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
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: fullText,
                  displayText: fullText,
                };
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
    if (messages.length === 0) return;
    setSaving(true);
    setError("");

    const today = new Date().toISOString().split("T")[0];
    const firstQ = messages.find((m) => m.role === "user")?.displayText || "대화";
    const topic = firstQ
      .slice(0, 40)
      .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const path = `outputs/QA-${agent.name}-${today}-${topic}.md`;
    const message = `docs: QA 대화 저장 [${agent.name}] (by ${session?.user?.name})`;

    const content = [
      `# QA 대화 — ${agent.name} (${today})`,
      `작성자: ${session?.user?.name}`,
      "",
      "---",
      "",
      ...messages.map((m) =>
        `### ${m.role === "user" ? "Q" : "A"}\n\n${m.displayText}`
      ),
    ].join("\n\n");

    const res = await fetch("/api/github/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content, message }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "저장 실패");
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[420px]">
      {/* Info bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${agent.color.dot}`} />
          <span className="text-xs text-gray-500">
            {fileCount > 0
              ? `${fileCount}개 문서 컨텍스트 로드됨`
              : "축적된 문서 없음 (일반 PM 지식으로 답변)"}
          </span>
        </div>
        {messages.length > 0 && !saved && (
          <button
            onClick={handleSaveConversation}
            disabled={saving}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            {saving && <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? "저장 중..." : "이 대화 저장"}
          </button>
        )}
        {saved && <span className="text-xs text-green-600 font-medium">대화 저장 완료!</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className={`rounded-2xl p-5 border ${agent.color.bg} ${agent.color.border}`}>
            <p className="text-sm font-medium text-gray-700 mb-1">{agent.emoji} {agent.name} 어시스턴트</p>
            <p className="text-sm text-gray-500">
              축적된 {agent.name} 산출물을 바탕으로 질문에 답합니다.<br />
              이미지(와이어프레임, 스크린샷 등)도 첨부할 수 있어요.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : `bg-white border ${agent.color.border} text-gray-800 rounded-bl-sm`
              }`}
            >
              {msg.role === "assistant" && msg.displayText === "" ? (
                <div className="flex gap-1 py-0.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              ) : (
                <pre className={`whitespace-pre-wrap font-sans ${loading && i === messages.length - 1 && msg.role === "assistant" ? "streaming-cursor" : ""}`}>
                  {msg.displayText}
                </pre>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-flex">
          <img src={imagePreview} alt="attach" className="h-16 w-auto rounded-lg border border-gray-200" />
          <button
            onClick={() => { setImageFile(null); setImagePreview(""); }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center"
          >×</button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            title="이미지 첨부"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${agent.name} 관련 질문을 입력하세요... (Enter 전송, Shift+Enter 줄바꿈)`}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imageFile)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${agent.color.button}`}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
