"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { AGENTS, AgentKey } from "@/lib/agents";

interface Props {
  agentKey: AgentKey;
  apiKey: string;
  onNeedApiKey: () => void;
}

type InputTab = "text" | "pdf" | "image";

export default function SaveMode({ agentKey, apiKey, onNeedApiKey }: Props) {
  const { data: session } = useSession();
  const agent = AGENTS[agentKey];

  const [inputTab, setInputTab] = useState<InputTab>("text");
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [parsePdfLoading, setParsePdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setParsePdfLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("pdf", file);

    const res = await fetch("/api/parse/pdf", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setText(data.text);
    } else {
      setError("PDF 파싱 실패. 텍스트를 직접 붙여넣어 주세요.");
    }
    setParsePdfLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!apiKey) { onNeedApiKey(); return; }
    if (inputTab === "text" && !text.trim()) return;
    if (inputTab === "pdf" && !text.trim()) return;
    if (inputTab === "image" && !imageFile) return;

    setGenerating(true);
    setResult("");
    setError("");
    setSaved(false);

    const body: Record<string, unknown> = { agentKey, apiKey };

    if (inputTab === "image" && imageFile && imagePreview) {
      const base64 = imagePreview.split(",")[1];
      body.imageBase64 = base64;
      body.imageType = imageFile.type;
    } else {
      body.content = text;
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.result);
    } else {
      const err = await res.json();
      setError(err.error || "구조화 실패");
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError("");

    const today = new Date().toISOString().split("T")[0];
    const topicMatch = result.match(/\[주제\][:\s*]+(.+)/);
    const topic = (topicMatch?.[1] || "산출물")
      .trim()
      .replace(/\*\*/g, "")
      .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40);

    const agentPath = `${agent.folder}/${today}-${topic}.md`;
    const commitMsg = `docs(${agent.name}): ${topic} 저장 (by ${session?.user?.name})`;

    const res = await fetch("/api/github/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: agentPath, content: result, message: commitMsg }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "저장 실패");
    } else {
      setSaved(true);

      // Also save original PDF if present
      if (pdfFile) {
        const pdfPath = `docs/${today}-${topic}.pdf`;
        const buf = await pdfFile.arrayBuffer();
        const b64 = Buffer.from(buf).toString("base64");
        await fetch("/api/github/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pdfPath,
            content: b64,
            message: `docs: ${topic} 원본 PDF 저장`,
          }),
        });
      }
    }
    setSaving(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate =
    (inputTab === "text" && text.trim()) ||
    (inputTab === "pdf" && text.trim()) ||
    (inputTab === "image" && !!imageFile);

  return (
    <div className="space-y-5">
      {/* Agent indicator */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${agent.color.badge}`}>
        <span>{agent.emoji}</span>
        {agent.name} 에이전트
      </div>

      {/* Input tabs */}
      <div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-3 w-fit">
          {(["text", "pdf", "image"] as InputTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setInputTab(t); setError(""); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                inputTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "text" ? "텍스트" : t === "pdf" ? "PDF" : "이미지"}
            </button>
          ))}
        </div>

        {/* Text input */}
        {inputTab === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="다른 AI 도구에서 작업한 산출물을 붙여넣으세요..."
            className="w-full h-52 px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* PDF input */}
        {inputTab === "pdf" && (
          <div>
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">
                {pdfFile ? pdfFile.name : "PDF 파일을 클릭하여 선택"}
              </p>
              {parsePdfLoading && <p className="text-xs text-gray-400 mt-1">텍스트 추출 중...</p>}
            </div>
            <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfSelect} className="hidden" />
            {text && !parsePdfLoading && (
              <p className="mt-2 text-xs text-green-600">텍스트 추출 완료 ({text.length.toLocaleString()}자)</p>
            )}
          </div>
        )}

        {/* Image input */}
        {inputTab === "image" && (
          <div>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full max-h-64 object-contain" />
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">이미지를 클릭하여 선택</p>
                  <p className="text-xs text-gray-400 mt-1">와이어프레임, 스크린샷 등</p>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={generating || !canGenerate || parsePdfLoading}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-40 ${agent.color.button}`}
        >
          {generating && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {generating ? "구조화 중..." : "구조화"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">구조화된 산출물</span>
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
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {saving && <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {saved ? "저장 완료!" : saving ? "저장 중..." : "GitHub에 저장"}
              </button>
            </div>
          </div>
          <div className={`border rounded-xl p-4 ${agent.color.bg} ${agent.color.border}`}>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{result}</pre>
          </div>
          {saved && (
            <p className="mt-2 text-sm text-green-600">
              GitHub <code className="bg-green-50 px-1 rounded">{agent.folder}/</code> 에 저장되었습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
