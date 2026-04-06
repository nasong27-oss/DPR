"use client";

import { useState } from "react";

interface Props {
  initialClaude?: string;
  initialGemini?: string;
  onSave: (claudeKey: string, geminiKey: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ initialClaude = "", initialGemini = "", onSave, onClose }: Props) {
  const [claude, setClaude] = useState(initialClaude);
  const [gemini, setGemini] = useState(initialGemini);

  const canSave = claude.trim() || gemini.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave(claude.trim(), gemini.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">API 키 등록</h2>
          <p className="text-sm text-gray-500 mt-1">
            Anthropic 또는 Gemini 중 하나 이상 등록이 필요합니다.
            키는 세션에만 유지되며 서버에 저장되지 않습니다.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Gemini Card */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✨</span>
              <span className="font-semibold text-gray-900">Gemini API (Google)</span>
              <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">기본값</span>
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
              placeholder="AIza..."
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {gemini && (
              <p className="text-xs text-blue-600 mt-1">✓ Gemini 키 입력됨</p>
            )}
          </div>

          {/* Claude Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🤖</span>
              <span className="font-semibold text-gray-900">Claude API (Anthropic)</span>
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
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            />
            {claude && (
              <p className="text-xs text-gray-600 mt-1">✓ Claude 키 입력됨</p>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
            두 키를 모두 등록하면 대화 시 모델을 선택할 수 있습니다.
            이미지 생성/수정 기능은 Gemini API 키가 반드시 필요합니다.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
