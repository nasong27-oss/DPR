import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GH = "https://api.github.com";

function ghHeaders() {
  return {
    Authorization: `token ${process.env.GITHUB_PAT}`,
    Accept: "application/vnd.github.v3+json",
  };
}

type GHFile = { name: string; download_url: string; type: string };

async function loadFolder(owner: string, repo: string, folder: string): Promise<{ files: string[]; content: string }> {
  const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${folder}`, {
    headers: ghHeaders(),
  });
  if (!res.ok) return { files: [], content: "" };

  const items: GHFile[] = await res.json();
  const mdFiles = items.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const contents = await Promise.all(
    mdFiles.map(async (f) => {
      const r = await fetch(f.download_url);
      const text = await r.text();
      return `## ${f.name}\n\n${text}`;
    })
  );

  return {
    files: mdFiles.map((f) => f.name),
    content: contents.join("\n\n---\n\n"),
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || "agents/research";

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;

  // Load agent folder + shared/ in parallel
  const [agentData, sharedData] = await Promise.all([
    loadFolder(owner, repo, folder),
    loadFolder(owner, repo, "shared"),
  ]);

  const combinedContent = [
    agentData.content ? `# 에이전트 산출물\n\n${agentData.content}` : "",
    sharedData.content ? `# 공유 지식 (shared/)\n\n${sharedData.content}` : "",
  ]
    .filter(Boolean)
    .join("\n\n===\n\n");

  return NextResponse.json({
    files: agentData.files,
    sharedFiles: sharedData.files,
    content: combinedContent,
  });
}
