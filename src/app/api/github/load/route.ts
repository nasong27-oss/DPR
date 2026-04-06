import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadAllAgents, loadMasterPrompt } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [agents, masterPrompt] = await Promise.all([
    loadAllAgents(),
    loadMasterPrompt(),
  ]);

  return NextResponse.json({ agents, masterPrompt });
}
