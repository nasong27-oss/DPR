import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ghListFolder, ghDeleteFile } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentId } = await req.json();
  if (!agentId) return NextResponse.json({ error: "Missing agentId" }, { status: 400 });

  const author = {
    name: session.user.name || "PM Team",
    email: session.user.email || "pm@team.com",
  };

  const folder = `registry/${agentId}`;
  const files = await ghListFolder(folder);

  // Delete all files in agent folder
  await Promise.all(
    files
      .filter((f) => f.type === "file")
      .map((f) =>
        ghDeleteFile(f.path, `chore: delete agent ${agentId}`, author)
      )
  );

  return NextResponse.json({ success: true });
}
