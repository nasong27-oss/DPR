"use client";

import { AGENTS, AgentKey } from "@/lib/agents";

interface Props {
  agentKey: AgentKey;
  files: string[];
  sharedFiles: string[];
  loading: boolean;
  onRefresh: () => void;
}

export default function FileList({ agentKey, files, sharedFiles, loading, onRefresh }: Props) {
  const agent = AGENTS[agentKey];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">저장된 파일</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="새로고침"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Agent files */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2 ${agent.color.badge}`}>
          <span>{agent.emoji}</span>
          {agent.name}
        </div>
        {loading ? (
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <p className="text-xs text-gray-400 py-2 px-1">아직 저장된 파일이 없습니다</p>
        ) : (
          <ul className="space-y-1">
            {files.map((name) => (
              <li key={name}>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 group">
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${agent.color.text}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600 truncate" title={name}>{name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Shared files */}
      {sharedFiles.length > 0 && (
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2 bg-gray-100 text-gray-600">
            🔗 공유 지식
          </div>
          <ul className="space-y-1">
            {sharedFiles.map((name) => (
              <li key={name}>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-500 truncate" title={name}>{name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {files.length + sharedFiles.length}개 파일 로드됨
        </p>
      </div>
    </div>
  );
}
