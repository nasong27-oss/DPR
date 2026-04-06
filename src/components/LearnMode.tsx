"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function LearnMode() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setGenerating(true);
    setResult("");
    setError("");
    setSaved(false);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "생성 실패");
      setGenerating(false);
      return;
    }

    const data = await res.json();
    setResult(data.result);
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError("");

    const today = new Date().toISOString().split("T")[0];
    // Extract topic from result
    const topicMatch = result.match(/\[리서치 주제\][:\s]*(.+)/);
    const topic = topicMatch
      ? topicMatch[1].trim().replace(/[^가-힣a-zA-Z0-9]/g, "-").slice(0, 40)
      : "research";
    const path = `research/${today}-${topic}.md`;
    const message = `docs: ${topic} 리서치 추가 (by ${session?.user?.name})`;

    const res = await fetch("/api/github/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content: result, message }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "저장 실패");
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          리서치 내용 입력
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="형식 무관하게 자유롭게 리서치 내용을 입력하세요..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleGenerate}
            disabled={generating || !input.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {generating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {generating ? "생성 중..." : "프롬프트 생성"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              구조화된 리서치
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? "복사됨!" : "복사하기"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {saving && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {saved ? "저장 완료!" : saving ? "저장 중..." : "GitHub에 바로 저장"}
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {result}
            </pre>
          </div>
          {saved && (
            <p className="mt-2 text-sm text-green-600">
              GitHub research/ 폴더에 저장되었습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
