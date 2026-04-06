import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ghGetFile, ghPutFile } from "@/lib/github";
import { AgentMeta } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId } = await req.json();
  if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

  const author = {
    name: session.user.name || "PM Team",
    email: session.user.email || "pm@team.com",
  };

  const metaPath = `registry/${agentId}/meta.json`;
  const metaFile = await ghGetFile(metaPath);
  if (!metaFile) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const meta: AgentMeta = JSON.parse(metaFile.content);
  meta.excluded = true;
  meta.updated = new Date().toISOString().split("T")[0];

  await ghPutFile(
    metaPath,
    JSON.stringify(meta, null, 2),
    `chore: exclude agent ${agentId} from learning`,
    author,
    metaFile.sha
  );

  return NextResponse.json({ success: true });
}
