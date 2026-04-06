import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path, content, message } = await req.json();

  if (!path || !content || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const pat = process.env.GITHUB_PAT!;
  const authorName = session.user.name || "PM Team";
  const authorEmail = session.user.email || "pm@team.com";

  const headers = {
    Authorization: `token ${pat}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  // Check if file exists to get SHA for update
  let sha: string | undefined;
  try {
    const checkRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist, create new
  }

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
    committer: { name: authorName, email: authorEmail },
    author: { name: authorName, email: authorEmail },
  };

  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, url: data.content?.html_url });
}
