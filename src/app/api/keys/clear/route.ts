import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hashEmail } from "@/lib/crypto";
import { ghDeleteFile } from "@/lib/github";

const COOKIE_NAME = "pm_hub_keys";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const fileHash = hashEmail(email);

  // Delete from GitHub (ignore errors if file doesn't exist)
  try {
    await ghDeleteFile(
      `registry/.keys/${fileHash}.enc`,
      "chore: remove encrypted api keys",
      { name: "PM Hub System", email: "system@pm-hub.internal" }
    );
  } catch {
    // File may not exist, that's fine
  }

  // Expire cookie
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
