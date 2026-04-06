"use client";

import { useState } from "react";

interface Props {
  agentId: string;
}

export default function FeedbackSection({ agentId }: Props) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/github/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, feedback: text }),
    });

    if (res.ok) {
      setSubmitted(true);
      setText("");
      setTimeout(() => setSubmitted(false), 4000);
    } else {
      setError("피드백 저장에 실패했습니다.");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="bg-gray-50 rounded-xl p-4 mb-3 text-sm text-gray-600 leading-relaxed">
        <p>
          💬 이 피드백은 완전한 익명으로 수집됩니다.<br />
          작성자 정보는 저장되지 않으며, 에이전트 개선 학습에만 활용됩니다.<br />
          다른 이용자나 등록자에게 공개되지 않습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="이 에이전트에 대한 피드백을 남겨주세요..."
          className="w-full h-24 px-3 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {submitting ? "저장 중..." : submitted ? "저장됨!" : "피드백 남기기"}
          </button>
        </div>
      </form>
    </div>
  );
}
