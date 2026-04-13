import { ghGetFile } from "@/lib/github";
import PlanPrintButton from "./PlanPrintButton";

export const dynamic = "force-dynamic";

// ── Data types ──────────────────────────────────────────────────
interface PlanData {
  subtitle: string;
  overview: string;
  philosophy: { title: string; desc: string }[];
  layerDiagram: string;
  features: { icon: string; title: string; desc: string }[];
  dataStructure: string;
  dataNotes: string[];
  techStack: { label: string; items: string[] }[];
  roadmap: { phase: string; color: "blue" | "purple" | "green"; items: string[] }[];
  security: { key: string; value: string }[];
  teamAccess: string;
  checklist: string[];
}

// ── Parser ──────────────────────────────────────────────────────
function parsePlan(md: string): PlanData {
  // First blockquote line → subtitle / tagline
  const subtitleMatch = md.match(/^> (.+)/m);
  const subtitle = subtitleMatch?.[1]?.replace(/\s+$/, "").replace(/\s*\(.+\)$/, "").trim() ?? "";

  // Extract a named section's raw text
  const lines = md.split("\n");
  function extractSection(heading: string): string {
    const startIdx = lines.findIndex((l) => l.startsWith("## ") && l.includes(heading));
    if (startIdx === -1) return "";
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith("## "));
    return lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx).join("\n");
  }

  // ── Overview
  const overview = extractSection("프로젝트 개요")
    .replace(/^---\s*$/gm, "")
    .trim()
    .replace(/\n+/g, " ")
    .replace(/  +/g, " ");

  // ── Philosophy cards  (### N. Title\n content\n)
  const philRaw = extractSection("플랫폼 사상");
  const philosophy: PlanData["philosophy"] = [];
  const philParts = philRaw.split(/^### \d+\. /m).slice(1);
  for (const part of philParts) {
    const nlIdx = part.indexOf("\n");
    const title = nlIdx === -1 ? part.trim() : part.slice(0, nlIdx).trim();
    const desc = nlIdx === -1 ? "" : part.slice(nlIdx + 1).replace(/\n/g, " ").trim();
    philosophy.push({ title, desc });
  }

  // ── Layer diagram (first ``` block)
  const layerRaw = extractSection("동작 구조");
  const codeBlock = layerRaw.match(/```([\s\S]*?)```/);
  const layerDiagram = codeBlock
    ? codeBlock[1].replace(/^\w*\n/, "").trimEnd()
    : "";

  // ── Features table  (| title | desc |)
  const featRaw = extractSection("핵심 기능");
  const featureIcons: Record<string, string> = {
    "에이전트 등록": "📝",
    "마스터 에이전트": "★",
    "스트리밍": "💬",
    "웹 검색": "🔍",
    "익명": "💌",
    "이미지": "🖼️",
  };
  const features: PlanData["features"] = [];
  for (const row of featRaw.split("\n")) {
    const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2 || cols[0] === "기능" || /^-+$/.test(cols[0])) continue;
    const iconKey = Object.keys(featureIcons).find((k) => cols[0].includes(k));
    features.push({ icon: iconKey ? featureIcons[iconKey] : "•", title: cols[0], desc: cols[1] });
  }

  // ── Data structure (first ``` block + bullet notes)
  const dataRaw = extractSection("데이터 구조");
  const dataCode = dataRaw.match(/```([\s\S]*?)```/);
  const dataStructure = dataCode ? dataCode[1].replace(/^\w*\n/, "").trimEnd() : "";
  const dataNotes = (dataRaw.match(/^- (.+)$/gm) ?? []).map((l) => l.slice(2));

  // ── Tech stack table
  const techRaw = extractSection("기술 스택");
  const techStack: PlanData["techStack"] = [];
  for (const row of techRaw.split("\n")) {
    const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2 || cols[0] === "영역" || /^-+$/.test(cols[0])) continue;
    techStack.push({ label: cols[0], items: cols[1].split(/[,，]/).map((s) => s.trim()) });
  }

  // ── Roadmap  (**단기/중기/장기**\n- item1 / item2)
  const roadRaw = extractSection("로드맵");
  const phaseColors: Record<string, "blue" | "purple" | "green"> = {
    단기: "blue", 중기: "purple", 장기: "green",
  };
  const roadmap: PlanData["roadmap"] = [];
  let rmMatch: RegExpExecArray | null;
  const rmRegex = /\*\*([^*]+)\*\*\n- (.+)/g;
  while ((rmMatch = rmRegex.exec(roadRaw)) !== null) {
    const phase = rmMatch[1].trim();
    const items = rmMatch[2].split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
    roadmap.push({ phase, color: phaseColors[phase] ?? "blue", items });
  }

  // ── Appendix
  const appRaw = extractSection("부가 사항");
  const security: PlanData["security"] = [];
  for (const row of appRaw.split("\n")) {
    const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2 || cols[0] === "항목" || /^-+$/.test(cols[0])) continue;
    security.push({ key: cols[0], value: cols[1] });
  }
  const teamMatch = appRaw.match(/### 팀 접근 제어\n([\s\S]+?)(?=\n###|$)/);
  const teamAccess = teamMatch?.[1]?.trim() ?? "";
  const checkMatch = appRaw.match(/### 개발 완료 항목\n([\s\S]+?)(?=\n###|$)/);
  const checklist = checkMatch
    ? (checkMatch[1].match(/^- (.+)$/gm) ?? []).map((l) => l.slice(2).trim())
    : [];

  return { subtitle, overview, philosophy, layerDiagram, features, dataStructure, dataNotes, techStack, roadmap, security, teamAccess, checklist };
}

// ── Page ────────────────────────────────────────────────────────
export default async function PlanPage() {
  const file = await ghGetFile("PLAN.md");
  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        PLAN.md를 불러올 수 없습니다.
      </div>
    );
  }
  const plan = parsePlan(file.content);

  return (
    <>
      <PlanPrintButton />
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="max-w-4xl mx-auto px-8 py-16 print:py-8 print:px-12">

          {/* Cover */}
          <div className="mb-20 print:mb-14">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex-shrink-0" />
              <span className="text-sm text-gray-400 font-medium tracking-widest uppercase">PM Agent Hub</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              {plan.subtitle || "PM 에이전트 허브"}
            </h1>
            {plan.overview && (
              <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                {plan.overview}
              </p>
            )}
            <div className="mt-10 pt-8 border-t border-gray-100 text-sm text-gray-400">
              2026년 4월 · dpr-agent-hub
            </div>
          </div>

          {/* 01. 플랫폼 사상 */}
          {plan.philosophy.length > 0 && (
            <Section number="01" title="플랫폼 사상">
              <div className="space-y-5">
                {plan.philosophy.map((p, i) => (
                  <PhilosophyCard key={i} index={String(i + 1)} title={p.title} desc={p.desc} />
                ))}
              </div>
            </Section>
          )}

          {/* 02. 동작 구조 */}
          <Section number="02" title="동작 구조">
            <p className="text-gray-500 leading-relaxed mb-8">
              에이전트 등록에서 실행까지, 플랫폼은 세 가지 레이어로 동작한다.
            </p>
            {plan.layerDiagram ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 font-mono text-sm text-gray-700 leading-loose whitespace-pre overflow-x-auto">
                {plan.layerDiagram}
              </div>
            ) : (
              <div className="space-y-3">
                <LayerBox label="실행 레이어" color="bg-slate-900 text-white"
                  content="마스터 에이전트 (Master Agent)"
                  desc="등록된 모든 에이전트를 통합하여 팀 전체의 역량을 하나로 실행" />
                <div className="flex justify-center text-gray-300 text-xl">↕</div>
                <div className="grid grid-cols-3 gap-3">
                  {["리서치 에이전트", "경쟁사 분석 에이전트", "마케팅 전략 에이전트"].map((n) => (
                    <div key={n} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <p className="text-xs font-medium text-slate-700">{n}</p>
                      <p className="text-xs text-slate-400 mt-1">독립 실행 가능</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center text-gray-300 text-xl">↕</div>
                <LayerBox label="학습 레이어" color="bg-gray-100 text-gray-700"
                  content="GitHub 공동 맥락 저장소"
                  desc="익명화된 피드백 · 정제된 프롬프트 · 대화 기록 → 집단 지성" />
              </div>
            )}
          </Section>

          {/* 03. 핵심 기능 */}
          {plan.features.length > 0 && (
            <Section number="03" title="핵심 기능">
              <div className="space-y-4">
                {plan.features.map((f, i) => (
                  <FeatureRow key={i} icon={f.icon} title={f.title} desc={f.desc} />
                ))}
              </div>
            </Section>
          )}

          {/* 04. 데이터 구조 */}
          <Section number="04" title="데이터 구조 (GitHub 저장소)">
            <p className="text-gray-500 leading-relaxed mb-6">
              모든 데이터는 GitHub에 저장된다. 특정 플랫폼이나 소유자에 종속되지 않으며,
              팀이 도구를 바꾸더라도 축적된 에이전트 자산은 영구히 보존된다.
            </p>
            {plan.dataStructure ? (
              <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm text-gray-700 leading-loose whitespace-pre overflow-x-auto">
                {plan.dataStructure}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm text-gray-700 leading-loose">
                <p>registry/</p>
                <p className="pl-4">└─ {"{agentId}/"}<span className="text-blue-600">meta.json / prompt.md / refined.md / feedback.md</span></p>
                <p className="mt-2">master/<span className="text-purple-600">master-prompt.md</span></p>
                <p>context/<span className="text-green-600">{"{agentId}"}/learn-{"{date}"}-{"{hash}"}.md</span></p>
              </div>
            )}
            {plan.dataNotes.length > 0 && (
              <ul className="mt-4 space-y-1">
                {plan.dataNotes.map((n, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                    <span>*</span><span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* 05. 기술 스택 */}
          {plan.techStack.length > 0 && (
            <Section number="05" title="기술 스택">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {plan.techStack.map(({ label, items }) => (
                  <div key={label} className="p-4 border border-gray-100 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                    {items.map((item) => (
                      <p key={item} className="text-sm text-gray-700 py-0.5">{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 06. 향후 로드맵 */}
          {plan.roadmap.length > 0 && (
            <Section number="06" title="향후 로드맵">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {plan.roadmap.map((r) => (
                  <RoadmapCard key={r.phase} phase={r.phase} color={r.color} items={r.items} />
                ))}
              </div>
            </Section>
          )}

          {/* Appendix */}
          <div className="mt-16 pt-10 border-t-2 border-gray-100 print:break-before-page">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-8">부가 사항</p>

            {plan.security.length > 0 && (
              <AppendixSection title="보안 · API 키 관리">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {plan.security.map(({ key, value }) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-gray-400 min-w-[80px] flex-shrink-0">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </AppendixSection>
            )}

            {plan.teamAccess && (
              <AppendixSection title="팀 접근 제어">
                <p className="text-sm text-gray-500 leading-relaxed">{plan.teamAccess}</p>
              </AppendixSection>
            )}

            {plan.checklist.length > 0 && (
              <AppendixSection title="개발 완료 항목">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  {plan.checklist.map((item) => (
                    <div key={item} className="flex items-center gap-2 py-1">
                      <span className="text-green-500 text-xs">✓</span>
                      <span className="text-xs text-gray-500">{item}</span>
                    </div>
                  ))}
                </div>
              </AppendixSection>
            )}
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

// ── Sub-components ───────────────────────────────────────────────

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
    <div className={`p-5 border rounded-2xl ${colors[color] ?? colors.blue}`}>
      <p className="font-bold text-sm mb-3">{phase}</p>
      <ul className="space-y-2">
        {items.map((item) => (
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
