"use client";

import { useState } from "react";
import { AgentMeta } from "@/types";

interface Props {
  agent: AgentMeta;
  onDelete: () => void;
  onExclude: () => void;
  onClose: () => void;
  loading: boolean;
}

export default function DeleteModal({ agent, onDelete, onExclude, onClose, loading }: Props) {
  const [showSecond, setShowSecond] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900">에이전트 삭제</h2>
          <p className="text-sm text-gray-500 mt-1">
            <strong className="text-gray-700">{agent.name}</strong>
          </p>
        </div>

        {/* Option 1: Default delete */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              이 에이전트를 삭제합니다.<br />
              등록된 프롬프트와 학습 내용이 허브에서 제거되며
              마스터 에이전트에서도 제외됩니다.
            </p>
          </div>
          <button
            onClick={onDelete}
            disabled={loading}
            className="w-full py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {loading ? "처리 중..." : "삭제 확인"}
          </button>
        </div>

        {/* Option 2: Exclude (collapsible) */}
        <div className="px-6 pb-6">
          <button
            onClick={() => setShowSecond(!showSecond)}
            className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            <span>더보기</span>
            <svg
              className={`w-4 h-4 transition-transform ${showSecond ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSecond && (
            <div className="mt-2">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  이 에이전트를 마스터 에이전트 학습에서 완전히 제외합니다.<br />
                  파일은 GitHub에 보관되지만 앞으로 어떤 학습에도 활용되지 않습니다.
                  <br />
                  <strong className="text-red-600">이 작업은 되돌릴 수 없습니다.</strong>
                </p>
              </div>
              <button
                onClick={onExclude}
                disabled={loading}
                className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "처리 중..." : "학습 내용까지 삭제"}
              </button>
            </div>
          )}
        </div>

        {/* Cancel */}
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
