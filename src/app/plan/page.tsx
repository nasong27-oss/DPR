"use client";

export default function PlanPage() {
  const handlePrint = () => window.print();

  return (
    <>
      <div className="print:hidden fixed top-4 right-4 z-50">
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
          <div className="mb-20 print:mb-14">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex-shrink-0" />
              <span className="text-sm text-gray-400 font-medium tracking-widest uppercase">PM Agent Hub</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              팀의 AI 역량을<br />
              <span className="text-slate-400">하나의 집단 지성으로</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              PM팀 구성원 누구나 자신이 만든 AI 에이전트 프롬프트를 등록하면,
              개별 실행 또는 전체 통합 마스터 에이전트로 실행할 수 있는 팀 에이전트 허브.
              모든 에이전트와 프롬프트는 GitHub에 저장되며 버전 관리된다.
            </p>
            <div className="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-400">
              2026년 4월 · dpr-agent-hub
            </div>
          </div>

          {/* 1. 플랫폼 사상 */}
          <Section number="01" title="플랫폼 사상">
            <div className="space-y-5">
              <PhilosophyCard
                index="1"
                title="통합과 독립의 공존"
                desc="각각의 에이전트는 독립적으로 실행되는 동시에, 마스터 에이전트 안에서 통합되어 작동한다. 팀원 A의 UX 리서치 에이전트와 팀원 B의 경쟁사 분석 에이전트는 각자의 역할로도, 하나의 통합 PM 지성으로도 활용된다."
              />
              <PhilosophyCard
                index="2"
                title="개인의 맥락이 아닌 공동의 맥락"
                desc="대화의 맥락은 학습되지만, 개인의 맥락은 저장되지 않는다. 이 플랫폼을 사용하는 모든 구성원이 공유하는 공동의 맥락만이 축적된다. GitHub에 저장되는 학습 결과 역시 익명화되어 공동의 맥락으로만 반영된다."
              />
              <PhilosophyCard
                index="3"
                title="소유가 아닌 공유"
                desc="모든 학습의 내용은 GitHub에 저장되어, 특정 소유자에게 종속되지 않는다. 누군가 팀을 떠나더라도, 그가 기여한 AI 역량은 팀 전체의 자산으로 남는다. 지식은 사람이 아닌 조직에 귀속된다."
              />
              <PhilosophyCard
                index="4"
                title="에이전트의 지속적 성장"
                desc="등록된 각각의 에이전트는 플랫폼에 쌓인 학습 결과를 바탕으로 동작한다. 팀이 더 많이 사용할수록, 에이전트는 팀의 맥락과 언어를 더 깊이 이해하며 정교해진다."
              />
            </div>
          </Section>

          {/* 2. 동작 구조 */}
          <Section number="02" title="동작 구조">
            <p className="text-gray-500 leading-relaxed mb-8">
              에이전트 등록에서 실행까지, 플랫폼은 세 가지 레이어로 동작한다.
            </p>
            <div className="relative">
              {/* Layer diagram */}
              <div className="space-y-3">
                <LayerBox
                  label="실행 레이어"
                  color="bg-slate-900 text-white"
                  content="마스터 에이전트 (Master Agent)"
                  desc="등록된 모든 에이전트를 통합하여 팀 전체의 PM 역량을 하나로 실행"
                />
                <div className="flex justify-center text-gray-300 text-xl">↕</div>
                <div className="grid grid-cols-3 gap-3">
                  {["UX 리서치 에이전트", "경쟁사 분석 에이전트", "마케팅 전략 에이전트"].map((name) => (
                    <div key={name} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <p className="text-xs font-medium text-slate-700">{name}</p>
                      <p className="text-xs text-slate-400 mt-1">독립 실행 가능</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center text-gray-300 text-xl">↕</div>
                <LayerBox
                  label="학습 레이어"
                  color="bg-gray-100 text-gray-700"
                  content="GitHub 공동 맥락 저장소"
                  desc="익명화된 피드백 · 정제된 프롬프트 · 대화 기록 → 모든 에이전트가 공유하는 집단 지성"
                />
              </div>
            </div>
          </Section>

          {/* 3. 핵심 기능 */}
          <Section number="03" title="핵심 기능">
            <div className="space-y-4">
              <FeatureRow
                icon="📝"
                title="에이전트 등록 & 정제"
                desc="누구나 날것의 프롬프트를 등록하면 AI가 역할 명확화·중복 제거·출력 형식 표준화를 자동 수행한다. 원본 프롬프트와 정제본이 모두 GitHub에 버전 관리된다."
              />
              <FeatureRow
                icon="★"
                title="마스터 에이전트 자동 통합"
                desc="새 에이전트가 등록되거나 수정될 때마다 마스터 에이전트가 자동 재생성된다. 팀의 집단 지성은 항상 최신 상태를 유지한다."
              />
              <FeatureRow
                icon="💬"
                title="실시간 스트리밍 채팅"
                desc="에이전트별로, 또는 마스터 에이전트로 대화한다. Gemini · Claude 중 목적에 맞는 모델을 선택할 수 있다."
              />
              <FeatureRow
                icon="🔍"
                title="웹 검색 그라운딩 (Gemini)"
                desc="Gemini 모델은 Google Search를 통해 실시간 정보를 검색하고 답변에 반영한다. 최신 시장 동향, 경쟁사 뉴스, 업계 리포트를 실시간으로 활용할 수 있다."
              />
              <FeatureRow
                icon="💌"
                title="익명 피드백 & 집단 학습"
                desc="에이전트에 남긴 피드백은 작성자 정보 없이 공동 학습 데이터로 저장된다. 다음 프롬프트 정제 시 자동으로 반영되어 에이전트가 지속적으로 개선된다."
              />
              <FeatureRow
                icon="🖼️"
                title="이미지 생성 & 편집"
                desc="마케팅 소재, 화면 목업, 개념 시각화 이미지를 Gemini Vision으로 생성하고 편집한다."
              />
            </div>
          </Section>

          {/* 4. 데이터 구조 */}
          <Section number="04" title="데이터 구조 (GitHub 저장소)">
            <p className="text-gray-500 leading-relaxed mb-6">
              모든 데이터는 GitHub에 저장된다. 특정 플랫폼이나 소유자에 종속되지 않으며,
              팀이 도구를 바꾸더라도 축적된 에이전트 자산은 영구히 보존된다.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm text-gray-700 leading-loose">
              <p>registry/</p>
              <p className="pl-4">├─ {"{agentId}"}/<span className="text-blue-600">meta.json</span>       <span className="text-gray-400"># 이름·소유자·버전 메타데이터</span></p>
              <p className="pl-4">├─ {"{agentId}"}/<span className="text-blue-600">prompt.md</span>       <span className="text-gray-400"># 원본 프롬프트 (작성자 원문 보존)</span></p>
              <p className="pl-4">├─ {"{agentId}"}/<span className="text-blue-600">refined.md</span>      <span className="text-gray-400"># AI가 정제한 실행 프롬프트</span></p>
              <p className="pl-4">└─ {"{agentId}"}/<span className="text-green-600">feedback.md</span>    <span className="text-gray-400"># 익명 피드백 누적 (작성자 미저장)</span></p>
              <p className="mt-2">master/<span className="text-purple-600">master-prompt.md</span>         <span className="text-gray-400"># 통합 마스터 에이전트 프롬프트</span></p>
              <p>outputs/                            <span className="text-gray-400"># 팀이 저장한 대화 기록</span></p>
            </div>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
              * feedback.md는 익명으로만 기록되어 누가 남겼는지 식별할 수 없습니다.<br />
              * 에이전트 삭제 시 해당 폴더 전체가 제거되지만, Git 히스토리로 언제든 복원 가능합니다.
            </p>
          </Section>

          {/* 5. 기술 스택 */}
          <Section number="05" title="기술 스택">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "프레임워크", items: ["Next.js 14", "React 18", "TypeScript 5.8"] },
                { label: "AI 모델", items: ["Gemini 2.5 / 3.1", "Claude Haiku / Sonnet / Opus", "Gemini Vision"] },
                { label: "인프라", items: ["GitHub API", "Google OAuth", "Vercel"] },
                { label: "UI", items: ["Tailwind CSS 3", "SSE 스트리밍", "반응형"] },
              ].map(({ label, items }) => (
                <div key={label} className="p-4 border border-gray-100 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                  {items.map(item => (
                    <p key={item} className="text-sm text-gray-700 py-0.5">{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </Section>

          {/* 6. 로드맵 */}
          <Section number="06" title="향후 로드맵">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <RoadmapCard phase="단기" color="blue" items={[
                "Gemini 3.1 모델 안정화",
                "대화 기록 내보내기 (PDF)",
                "에이전트 사용 통계 대시보드",
                "PDF 파일 컨텍스트 채팅",
              ]} />
              <RoadmapCard phase="중기" color="purple" items={[
                "팀원 권한 관리 (View/Edit/Admin)",
                "에이전트 버전 비교 & 롤백",
                "Slack / Notion 연동",
                "에이전트 공개 템플릿 공유",
              ]} />
              <RoadmapCard phase="장기" color="green" items={[
                "멀티팀 / 조직 분리 지원",
                "에이전트 체이닝 워크플로우",
                "음성 입력 인터페이스",
                "사내 문서 RAG 연동",
              ]} />
            </div>
          </Section>

          {/* Appendix — 부가 사항 */}
          <div className="mt-16 pt-10 border-t-2 border-gray-100 print:break-before-page">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-8">부가 사항</p>

            <AppendixSection title="보안 · API 키 관리">
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                API 키(Gemini / Claude)는 사용자 기기나 서버에 평문으로 저장되지 않습니다.
                동일 Google 계정으로 로그인하면 어떤 기기에서도 키가 자동 복원됩니다.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ["암호화 방식", "AES-256-GCM"],
                  ["키 유도", "HKDF-SHA256 (NEXTAUTH_SECRET + email)"],
                  ["영구 저장", "GitHub 암호화 파일 (registry/.keys/)"],
                  ["세션 캐시", "HTTP-only 쿠키 (브라우저)"],
                  ["크로스 디바이스", "동일 Google 계정 → 자동 복원"],
                  ["로그아웃 시", "GitHub 파일 삭제 + 쿠키 만료"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-400 min-w-[80px] flex-shrink-0">{k}</span>
                    <span className="text-gray-600">{v}</span>
                  </div>
                ))}
              </div>
            </AppendixSection>

            <AppendixSection title="팀 접근 제어">
              <p className="text-sm text-gray-500 leading-relaxed">
                Google OAuth 로그인 후 팀 코드 입력을 통해 접근을 제어합니다.
                팀 코드는 환경 변수로 관리되며, 코드를 알고 있는 구성원만 플랫폼에 입장할 수 있습니다.
              </p>
            </AppendixSection>

            <AppendixSection title="개발 현황 체크리스트">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                {[
                  "Google OAuth + 팀 코드 접근 제어",
                  "에이전트 등록·수정·삭제·제외",
                  "AI 프롬프트 자동 정제",
                  "마스터 에이전트 자동 생성·재생성",
                  "실시간 스트리밍 채팅 (SSE)",
                  "Gemini Google Search 그라운딩",
                  "이미지 생성 및 편집",
                  "익명 피드백 & 집단 학습",
                  "AES-256-GCM 암호화 키 저장",
                  "멀티 모델 선택 UI",
                  "탭 전환 시 대화 상태 유지",
                  "모바일 반응형 레이아웃",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 py-1">
                    <span className="text-green-500 text-xs">✓</span>
                    <span className="text-xs text-gray-500">{item}</span>
                  </div>
                ))}
              </div>
            </AppendixSection>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-300">
            PM 에이전트 허브 · dpr-agent-hub · 2026
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 20mm 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16 print:mb-10 print:break-inside-avoid-page">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xs font-bold text-gray-300 tracking-widest">{number}</span>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PhilosophyCard({ index, title, desc }: { index: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {index}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function LayerBox({ label, color, content, desc }: {
  label: string; color: string; content: string; desc: string;
}) {
  return (
    <div className={`p-5 rounded-2xl ${color}`}>
      <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-bold text-base mb-1">{content}</p>
      <p className="text-xs opacity-70 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
      <span className="text-xl flex-shrink-0 w-8 text-center">{icon}</span>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function RoadmapCard({ phase, color, items }: { phase: string; color: string; items: string[] }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green: "bg-green-50 border-green-100 text-green-700",
  };
  return (
    <div className={`p-5 border rounded-2xl ${colors[color]}`}>
      <p className="font-bold text-sm mb-3">{phase}</p>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="text-xs flex gap-1.5 items-start text-gray-600">
            <span className="mt-0.5 flex-shrink-0 opacity-50">·</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppendixSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>
      {children}
    </div>
  );
}
