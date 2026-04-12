"use client";

import { useState } from "react";

interface Props {
  hasClaude?: boolean;
  hasGemini?: boolean;
  onSave: (hasClaude: boolean, hasGemini: boolean) => void;
  onClose: () => void;
}

export default function ApiKeyModal({
  hasClaude = false,
  hasGemini = false,
  onSave,
  onClose,
}: Props) {
  const [gemini, setGemini] = useState("");
  const [claude, setClaude] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const hasAny = hasClaude || hasGemini;
  const canSave = gemini.trim() || claude.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/keys/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: gemini.trim(),
          claudeKey: claude.trim(),
        }),
      });
      if (!res.ok) throw new Error("저장 실패");
      const data = await res.json();
      onSave(data.hasClaude, data.hasGemini);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    }
    setSaving(false);
  };

  const handleClear = async () => {
    setClearing(true);
    setError("");
    try {
      await fetch("/api/keys/clear", { method: "POST" });
      onSave(false, false);
    } catch {
      setError("키 삭제 중 오류가 발생했습니다.");
    }
    setClearing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">API 키 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            키는 암호화되어 구글 계정에 연동 저장됩니다.
            모든 기기에서 동일 계정으로 로그인하면 자동으로 복원됩니다.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Current status */}
          {hasAny && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <span>✓</span>
              <span>
                현재 저장된 키:{" "}
                {[hasGemini && "Gemini", hasClaude && "Claude"].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {/* Gemini Card */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✨</span>
              <span className="font-semibold text-gray-900">Gemini API (Google)</span>
              <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">기본값</span>
              {hasGemini && (
                <span className="text-xs text-green-600 font-medium">저장됨</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              텍스트 대화, 에이전트 실행, 프롬프트 정제<br />
              <strong className="text-blue-700">+ 이미지 생성 및 수정 가능</strong><br />
              무료로 시작 가능
            </p>
            <div className="bg-white border border-blue-200 rounded-lg p-3 text-xs text-gray-600 mb-3 space-y-0.5">
              <p className="font-medium text-gray-700">키 발급 방법:</p>
              <p>1. <span className="font-mono text-blue-600">aistudio.google.com</span> 접속</p>
              <p>2. Google 계정으로 로그인</p>
              <p>3. Get API Key → Create API Key</p>
              <p>4. 발급된 키 복사 후 아래에 입력</p>
            </div>
            <input
              type="password"
              value={gemini}
              onChange={(e) => setGemini(e.target.value)}
              placeholder={hasGemini ? "새 키 입력 시 교체됩니다 (빈칸이면 유지)" : "AIza..."}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {gemini && (
              <p className="text-xs text-blue-600 mt-1">✓ 새 Gemini 키 입력됨</p>
            )}
          </div>

          {/* Claude Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🤖</span>
              <span className="font-semibold text-gray-900">Claude API (Anthropic)</span>
              {hasClaude && (
                <span className="text-xs text-green-600 font-medium ml-auto">저장됨</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              텍스트 대화, 에이전트 실행, 프롬프트 정제<br />
              이미지 생성/수정 불가
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 mb-3 space-y-0.5">
              <p className="font-medium text-gray-700">키 발급 방법:</p>
              <p>1. <span className="font-mono text-gray-600">console.anthropic.com</span> 접속</p>
              <p>2. 회원가입 또는 로그인</p>
              <p>3. API Keys 메뉴 → Create Key</p>
              <p>4. 발급된 키 복사 후 아래에 입력</p>
            </div>
            <input
              type="password"
              value={claude}
              onChange={(e) => setClaude(e.target.value)}
              placeholder={hasClaude ? "새 키 입력 시 교체됩니다 (빈칸이면 유지)" : "sk-ant-..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            />
            {claude && (
              <p className="text-xs text-gray-600 mt-1">✓ 새 Claude 키 입력됨</p>
            )}
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            두 키를 모두 등록하면 대화 시 모델을 선택할 수 있습니다.
            이미지 생성/수정 기능은 Gemini API 키가 반드시 필요합니다.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {hasAny && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              {clearing ? "삭제 중..." : "키 삭제"}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
