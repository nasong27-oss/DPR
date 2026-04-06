import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GH = "https://api.github.com";

function ghHeaders() {
  return {
    Authorization: `token ${process.env.GITHUB_PAT}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path, content, message } = await req.json();
  if (!path || !content || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const authorName = session.user.name || "PM Team";
  const authorEmail = session.user.email || "pm@team.com";

  // Get existing SHA if file exists
  let sha: string | undefined;
  try {
    const check = await fetch(`${GH}/repos/${owner}/${repo}/contents/${path}`, {
      headers: ghHeaders(),
    });
    if (check.ok) {
      const data = await check.json();
      sha = data.sha;
    }
  } catch {}

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
    author: { name: authorName, email: authorEmail },
    committer: { name: authorName, email: authorEmail },
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, url: data.content?.html_url });
}
