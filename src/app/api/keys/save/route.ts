import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encryptKeys, decryptKeys, hashEmail } from "@/lib/crypto";
import { ghGetFile, ghPutFileSafe } from "@/lib/github";
import { cookies } from "next/headers";

const COOKIE_NAME = "pm_hub_keys";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;
  const { claudeKey: newClaude, geminiKey: newGemini } = await req.json();

  // Load existing keys to merge (keep existing if new value is blank)
  let existing: { claudeKey: string; geminiKey: string } = {
    claudeKey: "",
    geminiKey: "",
  };

  // Try cookie first, then GitHub
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    existing = decryptKeys(token, email) ?? existing;
  } else {
    const fileHash = hashEmail(email);
    const file = await ghGetFile(`registry/.keys/${fileHash}.enc`);
    if (file) {
      existing = decryptKeys(file.content.trim(), email) ?? existing;
    }
  }

  const merged = {
    claudeKey: newClaude !== "" ? (newClaude as string) : existing.claudeKey,
    geminiKey: newGemini !== "" ? (newGemini as string) : existing.geminiKey,
  };

  const ciphertext = encryptKeys(merged, email);

  // Save to GitHub
  const fileHash = hashEmail(email);
  await ghPutFileSafe(
    `registry/.keys/${fileHash}.enc`,
    ciphertext,
    "chore: update encrypted api keys",
    { name: "PM Hub System", email: "system@pm-hub.internal" }
  );

  // Set session cookie
  const response = NextResponse.json({
    hasClaude: !!merged.claudeKey,
    hasGemini: !!merged.geminiKey,
  });
  response.cookies.set(COOKIE_NAME, ciphertext, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
