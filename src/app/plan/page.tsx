"use client";

export default function PlanPage() {
  const handlePrint = () => window.print();

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-700 shadow-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          PDF로 저장
        </button>
      </div>

      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="max-w-4xl mx-auto px-8 py-16 print:py-8 print:px-12">

          {/* Cover */}
          <div className="mb-16 print:mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex-shrink-0" />
              <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">PM Agent Hub</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              PM 에이전트 허브<br />
              <span className="text-slate-500">프로젝트 플랜</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl">
              팀의 PM 역량을 AI 에이전트로 집약하고, 구글 계정으로 어디서든 활용할 수 있는 사내 AI 허브 플랫폼
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {["Next.js 14", "Gemini API", "Claude API", "Google OAuth", "GitHub API", "Vercel"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-gray-600">{tag}</span>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-400">
              작성일 2026년 4월 · dpr-agent-hub
            </div>
          </div>

          {/* 1. 배경 및 목적 */}
          <Section number="01" title="배경 및 목적">
            <p className="text-gray-600 leading-relaxed mb-6">
              PM팀은 시장 조사, 경쟁사 분석, PRD 작성, UX 리서치 등 다양한 업무에서 AI를 활용하고 있습니다.
              그러나 각자 개인 계정으로 AI 도구를 사용하면서 노하우가 분산되고, 팀 전체의 AI 활용 역량이 축적되지 않는 문제가 있었습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ProblemCard
                icon="📂"
                title="노하우 분산"
                desc="팀원별 프롬프트와 활용법이 개인 도구에만 남아 공유가 어려움"
              />
              <ProblemCard
                icon="🔑"
                title="반복 설정"
                desc="로그인할 때마다 API 키를 재입력해야 하는 번거로움"
              />
              <ProblemCard
                icon="🔀"
                title="역할 혼재"
                desc="UX 리서치·경쟁사 분석·마케팅 등 역할별 최적화된 AI가 없음"
              />
            </div>
          </Section>

          {/* 2. 핵심 기능 */}
          <Section number="02" title="핵심 기능">
            <div className="space-y-6">
              <FeatureBlock
                icon="🤖"
                title="에이전트 등록 & 관리"
                desc="팀원 누구나 자신의 PM 역할과 업무 방식을 프롬프트로 등록할 수 있습니다. AI가 원본 프롬프트를 자동으로 정제하여 일관된 품질을 유지합니다."
                tags={["역할 명확화", "중복 제거", "출력 형식 표준화"]}
              />
              <FeatureBlock
                icon="★"
                title="마스터 에이전트"
                desc="등록된 모든 에이전트의 역량을 하나로 통합한 마스터 에이전트가 자동 생성됩니다. 어떤 PM 질문이든 팀 전체의 집단 지성으로 답변합니다."
                tags={["자동 통합", "팀 전체 역량", "실시간 재생성"]}
              />
              <FeatureBlock
                icon="💬"
                title="실시간 AI 채팅"
                desc="Gemini와 Claude 중 원하는 모델을 선택해 에이전트와 대화합니다. 스트리밍 방식으로 실시간 응답을 제공합니다."
                tags={["Gemini 2.5/3.1", "Claude Haiku/Sonnet/Opus", "SSE 스트리밍"]}
              />
              <FeatureBlock
                icon="🔍"
                title="Gemini 웹 검색 그라운딩"
                desc="Gemini 모델은 Google Search를 통해 실시간 웹 정보를 검색하여 최신 뉴스, 경쟁사 동향, 시장 데이터를 답변에 반영합니다."
                tags={["Google Search", "실시간 정보", "자동 판단"]}
              />
              <FeatureBlock
                icon="🖼️"
                title="이미지 생성 & 편집"
                desc="Gemini 이미지 모델로 마케팅 소재, 화면 목업, 개념 시각화 이미지를 생성하고 편집합니다."
                tags={["생성", "편집", "마케팅 소재"]}
              />
              <FeatureBlock
                icon="💌"
                title="익명 피드백"
                desc="에이전트 품질 개선을 위한 익명 피드백 시스템. 피드백은 GitHub에 누적되고 다음 프롬프트 정제 시 자동 반영됩니다."
                tags={["익명 처리", "GitHub 저장", "자동 반영"]}
              />
            </div>
          </Section>

          {/* 3. 기술 스택 */}
          <Section number="03" title="기술 스택">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TechCard title="프론트엔드" items={[
                ["Next.js 14", "App Router · SSE 스트리밍"],
                ["React 18", "Client/Server Components"],
                ["Tailwind CSS 3", "반응형 UI"],
                ["next-auth v4", "Google OAuth 2.0"],
              ]} />
              <TechCard title="AI / API" items={[
                ["Gemini API", "2.5 Flash/Pro, 3.1 Pro/Flash-Lite + 웹 검색"],
                ["Claude API", "Haiku 4.5 · Sonnet 4.6 · Opus 4.6"],
                ["Gemini Vision", "이미지 생성 · 편집"],
                ["Google Search", "실시간 그라운딩"],
              ]} />
              <TechCard title="저장 & 인프라" items={[
                ["GitHub API", "에이전트 레지스트리 저장소"],
                ["Vercel", "배포 · 엣지 함수"],
                ["HTTP-only Cookie", "세션 API 키 캐시"],
                ["AES-256-GCM", "키 암호화 저장"],
              ]} />
              <TechCard title="개발 도구" items={[
                ["TypeScript 5.8", "전체 타입 안전성"],
                ["pdf-parse", "PDF 컨텍스트 추출"],
                ["Node.js crypto", "HKDF 키 유도"],
                ["ESLint", "코드 품질 관리"],
              ]} />
            </div>
          </Section>

          {/* 4. 시스템 아키텍처 */}
          <Section number="04" title="시스템 아키텍처">
            <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm text-gray-700 leading-loose">
              <p className="text-gray-400 mb-2">{'// 요청 흐름'}</p>
              <p>브라우저 (Next.js 클라이언트)</p>
              <p className="pl-4 text-gray-400">↓ Google OAuth (NextAuth)</p>
              <p>서버 (Next.js API Routes)</p>
              <p className="pl-4 text-gray-400">↓ HTTP-only 쿠키에서 API 키 복호화</p>
              <p className="pl-4">├─ Gemini API  <span className="text-gray-400">← Google Search 그라운딩</span></p>
              <p className="pl-4">├─ Claude API</p>
              <p className="pl-4">└─ GitHub API  <span className="text-gray-400">← 에이전트 레지스트리</span></p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-400 mb-2">{'// 데이터 저장 (GitHub 저장소)'}</p>
                <p>registry/</p>
                <p className="pl-4">├─ {'{agentId}'}/meta.json      <span className="text-gray-400"># 메타데이터</span></p>
                <p className="pl-4">├─ {'{agentId}'}/refined.md     <span className="text-gray-400"># 정제된 프롬프트</span></p>
                <p className="pl-4">├─ {'{agentId}'}/feedback.md    <span className="text-gray-400"># 익명 피드백</span></p>
                <p className="pl-4">└─ .keys/{'{hash}'}.enc         <span className="text-gray-400"># 암호화된 API 키</span></p>
                <p>master/master-prompt.md           <span className="text-gray-400"># 통합 마스터 프롬프트</span></p>
                <p>outputs/                           <span className="text-gray-400"># 저장된 대화 기록</span></p>
              </div>
            </div>
          </Section>

          {/* 5. 보안 설계 */}
          <Section number="05" title="보안 설계">
            <p className="text-gray-600 leading-relaxed mb-6">
              API 키는 어디에도 평문으로 저장되지 않습니다. 사용자의 Google 계정(이메일)과 서버 비밀키(NEXTAUTH_SECRET)를
              조합하여 사용자별 고유 암호화 키를 생성합니다.
            </p>
            <div className="space-y-4">
              <SecurityRow
                step="1"
                title="키 저장 시"
                desc="HKDF-SHA256(NEXTAUTH_SECRET + email)으로 암호화 키 유도 → AES-256-GCM 암호화 → GitHub 파일 저장 + HTTP-only 쿠키 설정"
              />
              <SecurityRow
                step="2"
                title="재접속 시"
                desc="HTTP-only 쿠키 확인 → 없으면 GitHub 파일에서 복호화 → 쿠키 재설정 (어떤 기기에서도 동일 계정으로 접속 가능)"
              />
              <SecurityRow
                step="3"
                title="API 호출 시"
                desc="요청 본문에 키 미포함 → 서버에서 쿠키 읽기 → 복호화 후 API 호출 (클라이언트에 키 값 노출 없음)"
              />
              <SecurityRow
                step="4"
                title="로그아웃 시"
                desc="GitHub 암호화 파일 삭제 + 쿠키 만료 처리"
              />
            </div>
          </Section>

          {/* 6. 개발 현황 */}
          <Section number="06" title="개발 현황">
            <div className="space-y-2">
              {[
                ["✅", "Google OAuth 인증 및 팀 코드 접근 제어"],
                ["✅", "에이전트 등록·수정·삭제·제외 (GitHub CRUD)"],
                ["✅", "AI 프롬프트 자동 정제 (Gemini / Claude)"],
                ["✅", "마스터 에이전트 자동 생성·재생성"],
                ["✅", "실시간 스트리밍 채팅 (SSE)"],
                ["✅", "Gemini Google Search 웹 검색 그라운딩"],
                ["✅", "이미지 생성 및 편집 (Gemini Vision)"],
                ["✅", "익명 피드백 시스템"],
                ["✅", "AES-256-GCM 암호화 API 키 저장 (크로스 디바이스)"],
                ["✅", "모델 선택 UI (Gemini 2.5/3.1 · Claude 3종)"],
                ["✅", "탭 전환 시 채팅 상태 유지"],
                ["✅", "대화 복사 버튼 / GitHub 저장 기능"],
                ["✅", "모바일 반응형 레이아웃"],
              ].map(([status, item], i) => (
                <div key={i} className="flex items-start gap-3 py-1.5">
                  <span className="text-base flex-shrink-0">{status}</span>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 7. 향후 로드맵 */}
          <Section number="07" title="향후 로드맵">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <RoadmapCard
                phase="단기"
                color="bg-blue-50 border-blue-200"
                headerColor="text-blue-700"
                items={[
                  "Gemini 3.1 모델 안정화 반영",
                  "대화 내보내기 (PDF/DOCX)",
                  "에이전트별 사용 통계",
                  "PDF 파일 컨텍스트 채팅",
                ]}
              />
              <RoadmapCard
                phase="중기"
                color="bg-purple-50 border-purple-200"
                headerColor="text-purple-700"
                items={[
                  "팀원 권한 관리 (View/Edit/Admin)",
                  "에이전트 버전 히스토리 비교",
                  "Slack / Notion 연동",
                  "에이전트 공개 템플릿 마켓",
                ]}
              />
              <RoadmapCard
                phase="장기"
                color="bg-green-50 border-green-200"
                headerColor="text-green-700"
                items={[
                  "멀티팀 / 조직 분리 지원",
                  "자동화 워크플로우 (에이전트 체이닝)",
                  "음성 입력 인터페이스",
                  "사내 데이터 RAG 연동",
                ]}
              />
            </div>
          </Section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            <p>PM 에이전트 허브 · dpr-agent-hub · 2026</p>
            <p className="mt-1">Powered by Gemini API · Claude API · Next.js · GitHub</p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 20mm 15mm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14 print:mb-10 print:break-inside-avoid-page">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xs font-bold text-slate-400 tracking-widest">{number}</span>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProblemCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureBlock({ icon, title, desc, tags }: { icon: string; title: string; desc: string; tags: string[] }) {
  return (
    <div className="flex gap-4 p-5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechCard({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="p-5 border border-gray-200 rounded-xl">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {items.map(([name, desc]) => (
          <div key={name} className="flex items-start gap-2">
            <span className="text-xs font-medium text-gray-800 min-w-[100px] flex-shrink-0">{name}</span>
            <span className="text-xs text-gray-500">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityRow({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{step}</div>
      <div>
        <p className="font-semibold text-gray-800 text-sm mb-0.5">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function RoadmapCard({ phase, color, headerColor, items }: {
  phase: string; color: string; headerColor: string; items: string[];
}) {
  return (
    <div className={`p-5 border rounded-xl ${color}`}>
      <h3 className={`font-bold text-sm mb-3 ${headerColor}`}>{phase}</h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
