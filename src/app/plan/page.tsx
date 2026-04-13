import { ghGetFile } from "@/lib/github";
import PlanPrintButton from "./PlanPrintButton";

// Always fetch fresh from GitHub — no caching
export const dynamic = "force-dynamic";

async function renderMarkdown(text: string): Promise<string> {
  try {
    const res = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ text, mode: "gfm" }),
      cache: "no-store",
    });
    if (res.ok) return res.text();
  } catch {
    // fall through to plain text
  }
  // Fallback: wrap raw markdown in a <pre>
  return `<pre style="white-space:pre-wrap;word-break:break-word">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</pre>`;
}

export default async function PlanPage() {
  const file = await ghGetFile("PLAN.md");
  const html = file
    ? await renderMarkdown(file.content)
    : "<p>PLAN.md 파일을 불러올 수 없습니다.</p>";

  return (
    <>
      <PlanPrintButton />

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-16 print:py-8 print:px-12 md-body">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <style>{`
        .md-body { color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.75; }
        .md-body h1 { font-size: 2rem; font-weight: 700; margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
        .md-body h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-bottom: 0.25rem; border-bottom: 1px solid #f3f4f6; }
        .md-body h3 { font-size: 1.125rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
        .md-body h4 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #374151; }
        .md-body p { margin: 0.75rem 0; color: #374151; }
        .md-body ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .md-body ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .md-body li { margin: 0.3rem 0; color: #374151; }
        .md-body li > ul, .md-body li > ol { margin: 0.25rem 0; }
        .md-body code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; font-family: "SFMono-Regular", Consolas, monospace; color: #1f2937; }
        .md-body pre { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1rem 1.25rem; border-radius: 12px; overflow-x: auto; margin: 1rem 0; }
        .md-body pre code { background: none; padding: 0; font-size: 0.8rem; color: #374151; }
        .md-body blockquote { border-left: 4px solid #e5e7eb; padding: 0.25rem 1rem; margin: 1rem 0; color: #6b7280; background: #f9fafb; border-radius: 0 8px 8px 0; }
        .md-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        .md-body table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.9rem; }
        .md-body th { background: #f9fafb; font-weight: 600; text-align: left; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; }
        .md-body td { padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; vertical-align: top; }
        .md-body tr:nth-child(even) td { background: #fafafa; }
        .md-body strong { font-weight: 600; color: #111827; }
        .md-body em { font-style: italic; }
        .md-body a { color: #2563eb; text-decoration: underline; }
        .md-body a:hover { color: #1d4ed8; }
        .md-body img { max-width: 100%; border-radius: 8px; }
        @media print {
          @page { margin: 20mm 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .md-body pre { border: 1px solid #d1d5db; }
        }
      `}</style>
    </>
  );
}
