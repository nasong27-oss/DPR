"use client";

import { useState, useRef } from "react";

interface Props {
  geminiKey: string;
  agentId: string;
  onNeedGemini: () => void;
}

type ImageTab = "generate" | "edit";

export default function ImageMode({ geminiKey, agentId, onNeedGemini }: Props) {
  const [tab, setTab] = useState<ImageTab>("generate");

  // Generate state
  const [genPrompt, setGenPrompt] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<{ data: string; mimeType: string } | null>(null);
  const [genError, setGenError] = useState("");

  // Edit state
  const [editImageB64, setEditImageB64] = useState("");
  const [editImageMime, setEditImageMime] = useState("image/jpeg");
  const [editPreview, setEditPreview] = useState("");
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editResult, setEditResult] = useState<{ data: string; mimeType: string } | null>(null);
  const [editError, setEditError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!geminiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🖼️</div>
        <h3 className="text-base font-semibold text-gray-700 mb-2">
          이미지 기능은 Gemini API 키가 필요합니다
        </h3>
        <p className="text-sm text-gray-500 mb-5 max-w-sm">
          Gemini API는 Google AI Studio에서 무료로 발급받을 수 있습니다.
        </p>
        <ol className="text-sm text-gray-600 text-left mb-5 space-y-1">
          <li>1. <span className="font-mono text-blue-600">aistudio.google.com</span> 접속</li>
          <li>2. Google 계정으로 로그인</li>
          <li>3. Get API Key → Create API Key</li>
          <li>4. 발급된 키를 API 키 설정에 등록</li>
        </ol>
        <button
          onClick={onNeedGemini}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Gemini API 키 등록하기
        </button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    setGenError("");
    setGenResult(null);

    const res = await fetch("/api/image/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: genPrompt, geminiKey }),
    });

    const data = await res.json();
    if (res.ok) {
      setGenResult({ data: data.imageData, mimeType: data.mimeType });
    } else {
      setGenError(data.error || "생성 실패");
    }
    setGenLoading(false);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setEditPreview(result);
      setEditImageB64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!editImageB64 || !editInstruction.trim()) return;
    setEditLoading(true);
    setEditError("");
    setEditResult(null);

    const res = await fetch("/api/image/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: editImageB64,
        imageMimeType: editImageMime,
        instruction: editInstruction,
        geminiKey,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setEditResult({ data: data.imageData, mimeType: data.mimeType });
    } else {
      setEditError(data.error || "수정 실패");
    }
    setEditLoading(false);
  };

  const handleDownload = (imageData: string, mimeType: string, prefix: string) => {
    const ext = mimeType.split("/")[1] || "png";
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${imageData}`;
    link.download = `${prefix}-${Date.now()}.${ext}`;
    link.click();
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {(["generate", "edit"] as ImageTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "generate" ? "🎨 이미지 생성" : "✏️ 이미지 수정"}
          </button>
        ))}
      </div>

      {/* Generate */}
      {tab === "generate" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              생성 프롬프트
            </label>
            <textarea
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              placeholder="생성하고 싶은 이미지를 설명하세요..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={genLoading || !genPrompt.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {genLoading && (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {genLoading ? "생성 중..." : "이미지 생성"}
            </button>
          </div>
          {genError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {genError}
            </div>
          )}
          {genResult && (
            <div className="space-y-3">
              <img
                src={`data:${genResult.mimeType};base64,${genResult.data}`}
                alt="Generated"
                className="w-full max-h-96 object-contain rounded-xl border border-gray-200"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleDownload(genResult.data, genResult.mimeType, "generated")}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  다운로드
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit */}
      {tab === "edit" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              원본 이미지
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
            >
              {editPreview ? (
                <img src={editPreview} alt="original" className="w-full max-h-64 object-contain" />
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">이미지를 클릭하여 선택</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleEditImageSelect} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              수정 지시
            </label>
            <textarea
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder="예: 배경을 흰색으로 바꿔줘, 텍스트를 한국어로 변경해줘..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEdit}
              disabled={editLoading || !editImageB64 || !editInstruction.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {editLoading && (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {editLoading ? "수정 중..." : "이미지 수정"}
            </button>
          </div>

          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {editError}
            </div>
          )}

          {editResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">원본</p>
                  <img src={editPreview} alt="original" className="w-full rounded-xl border border-gray-200" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">수정본</p>
                  <img
                    src={`data:${editResult.mimeType};base64,${editResult.data}`}
                    alt="edited"
                    className="w-full rounded-xl border border-gray-200"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDownload(editResult.data, editResult.mimeType, "edited")}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  다운로드
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
