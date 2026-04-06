"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AGENTS, AgentKey } from "@/lib/agents";
import FileList from "@/components/FileList";
import SaveMode from "@/components/SaveMode";
import AskMode from "@/components/AskMode";

type Mode = "save" | "ask";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [agentKey, setAgentKey] = useState<AgentKey>("research");
  const [mode, setMode] = useState<Mode>("save");
  const [files, setFiles] = useState<string[]>([]);
  const [sharedFiles, setSharedFiles] = useState<string[]>([]);
  const [systemContent, setSystemContent] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // API key state (shared across modes)
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      if (sessionStorage.getItem("team_verified") !== "true") router.push("/auth/team-code");
      else {
        const saved = sessionStorage.getItem("anthropic_api_key");
        if (saved) setApiKey(saved);
      }
    }
  }, [status, router]);

  // Load files when agent changes
  const loadFiles = useCallback(async (key: AgentKey) => {
    setLoadingFiles(true);
    setFiles([]);
    setSharedFiles([]);
    setSystemContent("");
    try {
      const res = await fetch(`/api/github/load?folder=${AGENTS[key].folder}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setSharedFiles(data.sharedFiles || []);
        setSystemContent(data.content || "");
      }
    } catch {}
    setLoadingFiles(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && sessionStorage.getItem("team_verified") === "true") {
      loadFiles(agentKey);
    }
  }, [agentKey, status, loadFiles]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setApiKey(apiKeyInput.trim());
    sessionStorage.setItem("anthropic_api_key", apiKeyInput.trim());
    setShowApiKeyModal(false);
    setApiKeyInput("");
  };

  const agent = AGENTS[agentKey];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex-shrink-0" />
            <span className="font-semibold text-gray-900 text-sm hidden sm:block">PM 에이전트 허브</span>
          </div>

          <div className="flex items-center gap-2">
            {/* API key indicator */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                apiKey
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-green-500" : "bg-gray-400"}`} />
              {apiKey ? "API 키 설정됨" : "API 키 설정"}
            </button>

            <Link
              href="/guide"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              가이드
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <span className="text-sm text-gray-600 hidden md:block">{session?.user?.name}</span>
              <button
                onClick={() => { sessionStorage.clear(); signOut({ callbackUrl: "/" }); }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Agent tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {Object.values(AGENTS).map((a) => (
              <button
                key={a.key}
                onClick={() => { setAgentKey(a.key); setSidebarOpen(false); }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  agentKey === a.key
                    ? `${a.color.activeBorder} ${a.color.text}`
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{a.emoji}</span>
                <span className="hidden sm:inline">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex gap-5">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed bottom-5 left-5 z-40 sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${agent.color.button}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          파일 ({files.length})
        </button>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed sm:relative left-0 top-0 h-full sm:h-auto z-40 sm:z-auto
            w-64 sm:w-56 flex-shrink-0
            bg-white sm:bg-white border-r sm:border sm:rounded-2xl border-gray-200 p-4
            transition-transform sm:translate-x-0
            ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
            sm:block
          `}
        >
          <div className="pt-14 sm:pt-0">
            <FileList
              agentKey={agentKey}
              files={files}
              sharedFiles={sharedFiles}
              loading={loadingFiles}
              onRefresh={() => loadFiles(agentKey)}
            />
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
            {/* Mode toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode("save")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === "save" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  저장 모드
                </button>
                <button
                  onClick={() => setMode("ask")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === "ask" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  질문 모드
                </button>
              </div>

              {/* Mobile API key */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                  apiKey
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-green-500" : "bg-gray-400"}`} />
                {apiKey ? "API 설정됨" : "API 키"}
              </button>
            </div>

            {mode === "save" ? (
              <SaveMode
                agentKey={agentKey}
                apiKey={apiKey}
                onNeedApiKey={() => setShowApiKeyModal(true)}
              />
            ) : (
              <AskMode
                agentKey={agentKey}
                apiKey={apiKey}
                systemContent={systemContent}
                fileCount={files.length}
                onNeedApiKey={() => setShowApiKeyModal(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Anthropic API 키</h2>
            <p className="text-sm text-gray-500 mb-4">
              세션에만 유지되며 서버에 저장되지 않습니다.
            </p>
            <form onSubmit={handleApiKeySubmit} className="space-y-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!apiKeyInput.trim()}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  설정
                </button>
              </div>
            </form>
            {apiKey && (
              <button
                onClick={() => { setApiKey(""); sessionStorage.removeItem("anthropic_api_key"); setShowApiKeyModal(false); }}
                className="mt-3 w-full text-center text-xs text-red-400 hover:text-red-600"
              >
                현재 키 삭제
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
