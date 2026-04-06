"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { AgentMeta } from "@/types";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 30);
}

function generateId(name: string): string {
  const slug = slugify(name);
  const suffix = Date.now().toString(36).slice(-4);
  return `${slug}-${suffix}`;
}

function RegisterForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [refined, setRefined] = useState("");
  const [step, setStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingMeta, setExistingMeta] = useState<AgentMeta | null>(null);

  const claudeKey = typeof window !== "undefined" ? sessionStorage.getItem("claude_key") || "" : "";
  const geminiKey = typeof window !== "undefined" ? sessionStorage.getItem("gemini_key") || "" : "";

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated" && sessionStorage.getItem("team_verified") !== "true") {
      router.push("/auth/team-code");
      return;
    }
    if (editId && status === "authenticated") loadExisting(editId);
  }, [status, editId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExisting = async (id: string) => {
    setLoading(true);
    const res = await fetch("/api/github/load");
    if (res.ok) {
      const data = await res.json();
      const agent = data.agents?.find((a: { meta: AgentMeta; refinedPrompt: string }) => a.meta.id === id);
      if (agent) {
        setExistingMeta(agent.meta);
        setName(agent.meta.name);
        setDescription(agent.meta.description);
        setRefined(agent.refinedPrompt);
      }
    }
    setLoading(false);
  };

  const handleRefine = async () => {
    if (!originalPrompt.trim() && !editId) return;
    if (!geminiKey && !claudeKey) {
      setError("API 키가 필요합니다. 대시보드에서 API 키를 먼저 설정해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    // Load existing feedback if editing
    let feedback = "";
    if (editId) {
      const feedbackRes = await fetch(`/api/github/load`);
      // Use existing refined if no new prompt
      if (!originalPrompt.trim()) {
        setStep("preview");
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/agent/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalPrompt,
        agentName: name,
        description,
        feedback,
        geminiKey,
        claudeKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setRefined(data.refined);
      setStep("preview");
    } else {
      const err = await res.json();
      setError(err.error || "정제 실패");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !refined.trim()) return;
    setSaving(true);
    setError("");

    const today = new Date().toISOString().split("T")[0];
    const author = {
      name: session?.user?.name || "PM Team",
      email: session?.user?.email || "pm@team.com",
    };

    const agentId = editId || generateId(name);

    const meta: AgentMeta = existingMeta
      ? {
          ...existingMeta,
          name,
          description,
          updated: today,
          version: existingMeta.version + 1,
        }
      : {
          id: agentId,
          name,
          description,
          owner: session?.user?.name || "Unknown",
          email: session?.user?.email || "",
          created: today,
          updated: today,
          version: 1,
          excluded: false,
        };

    const commitMessage = editId
      ? `docs: update agent ${agentId} v${meta.version}`
      : `docs: add agent ${agentId}`;

    try {
      // Commit all files
      const files = [
        { path: `registry/${agentId}/meta.json`, content: JSON.stringify(meta, null, 2) },
        { path: `registry/${agentId}/refined.md`, content: refined },
        ...(originalPrompt.trim()
          ? [{ path: `registry/${agentId}/prompt.md`, content: originalPrompt }]
          : []),
        // Create empty feedback if new agent
        ...(!editId
          ? [{ path: `registry/${agentId}/feedback.md`, content: "# 피드백\n" }]
          : []),
      ];

      for (const file of files) {
        const res = await fetch("/api/github/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...file, message: commitMessage }),
        });
        if (!res.ok) throw new Error(`Failed to save ${file.path}`);
      }

      // Regenerate master prompt
      await fetch("/api/agent/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiKey, claudeKey }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
    setSaving(false);
  };

  if (status === "loading" || (editId && loading && !name)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            대시보드
          </button>
          <h1 className="font-semibold text-gray-900 text-sm">
            {editId ? "에이전트 수정" : "에이전트 등록"}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {step === "form" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                에이전트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: UX 리서치 전문가"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                한 줄 설명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 사용자 인터뷰와 시장 조사를 수행하는 리서치 에이전트"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                프롬프트 <span className="text-red-500">*</span>
                {editId && <span className="text-gray-400 font-normal ml-1">(수정하지 않으면 기존 정제본 유지)</span>}
              </label>
              <textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="형식 무관, 날것 그대로 붙여넣으세요. AI가 자동으로 정제합니다."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleRefine}
              disabled={loading || !name.trim() || !description.trim() || (!originalPrompt.trim() && !editId)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? "프롬프트 정제 중..." : "다음 단계 (프롬프트 정제)"}
            </button>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">정제된 프롬프트 미리보기</h2>
                <button
                  onClick={() => setStep("form")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← 수정
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {refined}
                </pre>
              </div>

              <div className="flex gap-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <span className="font-medium">{name}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{description}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? "GitHub에 저장 중..." : "GitHub에 저장 및 마스터 재생성"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
