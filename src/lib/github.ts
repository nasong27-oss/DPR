import { AgentMeta, AgentWithContent } from "@/types";

const GH = "https://api.github.com";
const owner = () => process.env.GITHUB_OWNER!;
const repo = () => process.env.GITHUB_REPO!;

export function ghHeaders() {
  return {
    Authorization: `token ${process.env.GITHUB_PAT}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

export async function ghGetFile(
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GH}/repos/${owner()}/${repo()}/contents/${path}`,
    { headers: ghHeaders() }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function ghPutFile(
  path: string,
  content: string,
  message: string,
  author: { name: string; email: string },
  sha?: string
): Promise<void> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
    author,
    committer: author,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${GH}/repos/${owner()}/${repo()}/contents/${path}`,
    { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed: ${err}`);
  }
}

export async function ghPutFileSafe(
  path: string,
  content: string,
  message: string,
  author: { name: string; email: string }
): Promise<void> {
  const existing = await ghGetFile(path);
  await ghPutFile(path, content, message, author, existing?.sha);
}

export async function ghDeleteFile(
  path: string,
  message: string,
  author: { name: string; email: string }
): Promise<void> {
  const file = await ghGetFile(path);
  if (!file) return;

  const res = await fetch(
    `${GH}/repos/${owner()}/${repo()}/contents/${path}`,
    {
      method: "DELETE",
      headers: ghHeaders(),
      body: JSON.stringify({ message, sha: file.sha, author, committer: author }),
    }
  );
  if (!res.ok) throw new Error(`GitHub DELETE failed for ${path}`);
}

export async function ghListFolder(
  folder: string
): Promise<Array<{ name: string; type: string; path: string }>> {
  const res = await fetch(
    `${GH}/repos/${owner()}/${repo()}/contents/${folder}`,
    { headers: ghHeaders() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function loadAllAgents(): Promise<AgentWithContent[]> {
  const entries = await ghListFolder("registry");
  const agentFolders = entries.filter((e) => e.type === "dir");

  const agents = await Promise.all(
    agentFolders.map(async (folder) => {
      const [metaFile, refinedFile] = await Promise.all([
        ghGetFile(`${folder.path}/meta.json`),
        ghGetFile(`${folder.path}/refined.md`),
      ]);
      if (!metaFile) return null;
      try {
        const meta: AgentMeta = JSON.parse(metaFile.content);
        if (meta.excluded) return null;
        return {
          meta,
          refinedPrompt: refinedFile?.content || "",
        } as AgentWithContent;
      } catch {
        return null;
      }
    })
  );

  return agents.filter((a): a is AgentWithContent => a !== null);
}

export async function loadMasterPrompt(): Promise<string> {
  const file = await ghGetFile("master/master-prompt.md");
  return file?.content || "";
}
