import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const pat = process.env.GITHUB_PAT!;

  const headers = {
    Authorization: `token ${pat}`,
    Accept: "application/vnd.github.v3+json",
  };

  // List files in research/ folder
  const listRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/research`,
    { headers }
  );

  if (!listRes.ok) {
    if (listRes.status === 404) {
      return NextResponse.json({ files: [], content: "" });
    }
    return NextResponse.json({ error: "Failed to list research files" }, { status: listRes.status });
  }

  const files: Array<{ name: string; download_url: string; type: string }> =
    await listRes.json();

  const mdFiles = files.filter(
    (f) => f.type === "file" && f.name.endsWith(".md")
  );

  // Fetch all file contents in parallel
  const contents = await Promise.all(
    mdFiles.map(async (file) => {
      const res = await fetch(file.download_url);
      const text = await res.text();
      return `# ${file.name}\n\n${text}`;
    })
  );

  return NextResponse.json({
    files: mdFiles.map((f) => f.name),
    content: contents.join("\n\n---\n\n"),
  });
}
