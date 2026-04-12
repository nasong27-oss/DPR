"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AgentWithContent, AgentMeta, ModelId } from "@/types";
import { getDefaultModelId } from "@/lib/models";
import AgentChat from "@/components/AgentChat";
import ApiKeyModal from "@/components/ApiKeyModal";
import DeleteModal from "@/components/DeleteModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [agents, setAgents] = useState<AgentWithContent[]>([]);
  const [masterPrompt, setMasterPrompt] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"master" | string>("master");

  // API key status (booleans only — actual keys stay server-side in encrypted cookie)
  const [hasClaude, setHasClaude] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  // Model
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-2.5-flash");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AgentMeta | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Master regen loading
  const [masterRegenLoading, setMasterRegenLoading] = useState(false);

  // Auth check + key status
  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated") {
      if (sessionStorage.getItem("team_verified") !== "true") {
        router.push("/auth/team-code");
        return;
      }
      // Fetch key status (checks cookie, falls back to GitHub)
      fetch("/api/keys/status")
        .then((r) => r.ok ? r.json() : { hasClaude: false, hasGemini: false })
        .then((data) => {
          setHasClaude(data.hasClaude);
          setHasGemini(data.hasGemini);
          if (!data.hasClaude && !data.hasGemini) setShowApiModal(true);
          setSelectedModel(getDefaultModelId(data.hasClaude, data.hasGemini) || "gemini-2.5-flash");
        });
    }
  }, [status, router]);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/github/load");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setMasterPrompt(data.masterPrompt || "");
      }
    } catch {}
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && sessionStorage.getItem("team_verified") === "true") {
      loadData();
    }
  }, [status, loadData]);

  const handleApiKeySave = (newHasClaude: boolean, newHasGemini: boolean) => {
    setHasClaude(newHasClaude);
    setHasGemini(newHasGemini);
    setSelectedModel(getDefaultModelId(newHasClaude, newHasGemini) || selectedModel);
    setShowApiModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    const res = await fetch("/api/github/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: deleteTarget.id }),
    });

    if (res.ok) {
      setAgents((prev) => prev.filter((a) => a.meta.id !== deleteTarget.id));
      if (activeTab === deleteTarget.id) setActiveTab("master");
      setDeleteTarget(null);
      regenMaster();
    }
    setDeleteLoading(false);
  };

  const handleExcludeConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    const res = await fetch("/api/github/exclude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: deleteTarget.id }),
    });

    if (res.ok) {
      setAgents((prev) => prev.filter((a) => a.meta.id !== deleteTarget.id));
      if (activeTab === deleteTarget.id) setActiveTab("master");
      setDeleteTarget(null);
      regenMaster();
    }
    setDeleteLoading(false);
  };

  const regenMaster = async () => {
    if (!hasClaude && !hasGemini) return;
    setMasterRegenLoading(true);
    const res = await fetch("/api/agent/master", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      setMasterPrompt(data.masterPrompt || "");
    }
    setMasterRegenLoading(false);
  };

  const userEmail = session?.user?.email || "";

  const apiStatus = () => {
    if (hasClaude && hasGemini) return { label: "🤖✨ 모두 연결됨", color: "text-green-600 bg-green-50 border-green-200" };
    if (hasGemini) return { label: "✨ Gemini 연결됨", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (hasClaude) return { label: "🤖 Claude 연결됨", color: "text-purple-600 bg-purple-50 border-purple-200" };
    return { label: "API 키 없음", color: "text-gray-500 bg-gray-50 border-gray-200" };
  };

  const status2 = apiStatus();

  const activeAgent = agents.find((a) => a.meta.id === activeTab);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex-shrink-0" />
            <span className="font-semibold text-gray-900 text-sm hidden sm:block">PM 에이전트 허브</span>
          </div>

          {masterRegenLoading && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              마스터 재생성 중
            </span>
          )}

          {/* API status */}
          <button
            onClick={() => setShowApiModal(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${status2.color}`}
          >
            {status2.label}
          </button>

          {/* Register button */}
          <Link
            href="/register"
            className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
          >
            + 에이전트 등록
          </Link>

          {/* User + logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <span className="text-sm text-gray-600 hidden md:block">{session?.user?.name}</span>
            <button
              onClick={() => { sessionStorage.clear(); signOut({ callbackUrl: "/" }); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Mobile action bar */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-2">
        <button
          onClick={() => setShowApiModal(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs border ${status2.color}`}
        >
          {status2.label}
        </button>
        <Link
          href="/register"
          className="flex-1 flex items-center justify-center py-1.5 bg-slate-900 text-white text-xs rounded-lg"
        >
          + 에이전트 등록
        </Link>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {/* Master tab */}
            <button
              onClick={() => setActiveTab("master")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeTab === "master"
                  ? "border-slate-900 text-slate-900 bg-slate-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">★</span>
              <span>마스터</span>
            </button>

            {loadingData ? (
              <div className="flex items-center px-4 gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              agents.map((agent) => (
                <button
                  key={agent.meta.id}
                  onClick={() => setActiveTab(agent.meta.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === agent.meta.id
                      ? "border-slate-700 text-slate-900 font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="font-medium">{agent.meta.name}</span>
                  <span className="text-xs text-gray-400 hidden sm:block">{agent.meta.owner}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">에이전트 로딩 중...</p>
              </div>
            </div>
          ) : activeTab === "master" ? (
            <AgentChat
              key="master"
              agentName="★ 마스터 에이전트"
              agentDescription={`${agents.length}개 에이전트 통합 · 전체 PM 역량을 하나로`}
              systemPrompt={masterPrompt}
              hasClaude={hasClaude}
              hasGemini={hasGemini}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          ) : activeAgent ? (
            <AgentChat
              key={activeAgent.meta.id}
              agentId={activeAgent.meta.id}
              agentName={activeAgent.meta.name}
              agentDescription={activeAgent.meta.description}
              agentOwner={activeAgent.meta.owner}
              systemPrompt={activeAgent.refinedPrompt}
              hasClaude={hasClaude}
              hasGemini={hasGemini}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isOwner={activeAgent.meta.email === userEmail}
              onEdit={() => router.push(`/register?id=${activeAgent.meta.id}`)}
              onDelete={() => setDeleteTarget(activeAgent.meta)}
            />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🤖</p>
              <p>에이전트를 선택하거나 새로 등록하세요</p>
              <Link
                href="/register"
                className="inline-block mt-4 px-5 py-2.5 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800"
              >
                + 첫 에이전트 등록하기
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showApiModal && (
        <ApiKeyModal
          hasClaude={hasClaude}
          hasGemini={hasGemini}
          onSave={handleApiKeySave}
          onClose={() => setShowApiModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          agent={deleteTarget}
          onDelete={handleDeleteConfirm}
          onExclude={handleExcludeConfirm}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
