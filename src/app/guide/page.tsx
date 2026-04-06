"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "level1" | "level2" | "level3";

const PROMPT_TEMPLATE = `이 대화를 GitHub 저장 형식으로 정리해줘.

[에이전트]: 리서치/화면설계/마케팅 중 선택
[주제]:
[날짜]: 오늘 날짜
[작성자]: 본인 이름
[핵심 산출물]:
[다른 에이전트에게 전달할 인사이트]:
[관련 키워드]:
[미해결 고민]:`;

export default function GuidePage() {
  const [tab, setTab] = useState<Tab>("level1");
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="font-semibold text-gray-900">에이전트 허브 가이드</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">산출물을 허브에 내보내는 방법</h1>
          <p className="text-gray-500">
            다른 AI 도구(Claude, ChatGPT 등)에서 작업한 산출물을 PM 에이전트 허브에 저장하면
            팀 전체의 지식 자산이 됩니다.
          </p>
        </div>

        {/* Level tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "level1" as Tab, label: "Level 1", sub: "웹앱 직접 저장", color: "blue" },
            { key: "level2" as Tab, label: "Level 2", sub: "프롬프트 복사", color: "purple" },
            { key: "level3" as Tab, label: "Level 3", sub: "Claude Code", color: "orange" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm transition-colors ${
                tab === t.key
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold">{t.label}</div>
              <div className={`text-xs mt-0.5 ${tab === t.key ? "text-gray-300" : "text-gray-400"}`}>{t.sub}</div>
            </button>
          ))}
        </div>

        {/* Level 1 */}
        {tab === "level1" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                비개발자 추천
              </div>
              <h2 className="text-lg font-semibold text-gray-900">웹앱을 통한 직접 저장</h2>
              <p className="text-sm text-gray-500 mt-1">가장 간단한 방법. 별도 설치 불필요.</p>
            </div>

            <ol className="space-y-4">
              {[
                {
                  step: "1",
                  title: "AI 도구에서 작업 완료",
                  desc: "Claude, ChatGPT 등 원하는 AI 도구에서 리서치/화면설계/마케팅 작업을 마칩니다.",
                },
                {
                  step: "2",
                  title: "PM 에이전트 허브 접속",
                  desc: "웹앱에 접속하여 Google 로그인 + 팀 코드를 입력합니다.",
                },
                {
                  step: "3",
                  title: "에이전트 선택 후 저장 모드",
                  desc: "대시보드에서 해당 에이전트(리서치/화면설계/마케팅)를 선택하고 저장 모드를 확인합니다.",
                },
                {
                  step: "4",
                  title: "내용 붙여넣기 또는 파일 업로드",
                  desc: "텍스트 탭에 대화 내용을 붙여넣거나, PDF/이미지를 업로드합니다.",
                },
                {
                  step: "5",
                  title: '"구조화" 클릭",',
                  desc: "AI가 산출물을 표준 형식으로 정리합니다. 검토 후 'GitHub에 저장'을 클릭하면 자동 커밋됩니다.",
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0 flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>팁:</strong> PDF나 이미지도 업로드 가능합니다. 와이어프레임 스크린샷,
                리서치 보고서 PDF 등을 그대로 업로드하면 AI가 내용을 분석해 구조화합니다.
              </p>
            </div>
          </div>
        )}

        {/* Level 2 */}
        {tab === "level2" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                AI 도구 직접 활용
              </div>
              <h2 className="text-lg font-semibold text-gray-900">대화 마지막에 프롬프트 실행</h2>
              <p className="text-sm text-gray-500 mt-1">
                AI 도구 대화 마지막에 아래 프롬프트를 실행하면 바로 저장 가능한 형식이 만들어집니다.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">복사용 프롬프트</span>
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {copied ? "복사됨!" : "원클릭 복사"}
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {PROMPT_TEMPLATE}
                </pre>
              </div>
            </div>

            <ol className="space-y-3">
              {[
                "위 프롬프트를 복사합니다.",
                "AI 도구 대화창 마지막에 붙여넣고 실행합니다.",
                "AI가 표준 형식으로 정리한 결과를 복사합니다.",
                "PM 에이전트 허브 → 저장 모드 → 텍스트 탭에 붙여넣기 → GitHub에 저장.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0 flex items-center justify-center">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Level 3 */}
        {tab === "level3" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                개발자 / 고급 사용자
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Claude Code로 직접 Push</h2>
              <p className="text-sm text-gray-500 mt-1">
                Claude Code를 사용한다면 레포를 클론하여 직접 커밋할 수 있습니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">1. 레포 클론</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <code className="text-green-400 text-sm font-mono">
                    git clone https://github.com/nasong27-oss/DPR.git
                    <br />
                    cd DPR
                  </code>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">2. 폴더 구조</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <pre className="text-green-400 text-sm font-mono">{`DPR/
├── agents/
│   ├── research/       ← 리서치 산출물
│   ├── design/         ← 화면설계 산출물
│   └── marketing/      ← 마케팅 산출물
├── shared/             ← 공통 지식
└── outputs/            ← QA 대화 이력`}</pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">3. 파일 저장 규칙</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <code className="text-green-400 text-sm font-mono">
                    agents/research/2025-01-15-사용자인터뷰.md
                    <br />
                    agents/design/2025-01-15-메인화면와이어프레임.md
                    <br />
                    agents/marketing/2025-01-15-론칭캠페인전략.md
                  </code>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">4. 커밋 & 푸시</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <code className="text-green-400 text-sm font-mono">
                    git add agents/research/2025-01-15-사용자인터뷰.md
                    <br />
                    git commit -m "docs(research): 사용자 인터뷰 저장"
                    <br />
                    git push origin main
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-orange-700">
                <strong>Claude Code 팁:</strong> 대화가 끝나면 Claude에게
                <em>"이 대화를 DPR 레포 형식으로 저장해줘"</em>라고 하면 자동으로
                파일을 만들고 커밋까지 해줍니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
