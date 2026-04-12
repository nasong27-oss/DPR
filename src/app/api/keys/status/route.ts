import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { decryptKeys, hashEmail } from "@/lib/crypto";
import { ghGetFile } from "@/lib/github";

const COOKIE_NAME = "pm_hub_keys";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ hasClaude: false, hasGemini: false });

  const email = session.user.email;
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Fast path: try cookie
  if (token) {
    const keys = decryptKeys(token, email);
    if (keys) {
      return NextResponse.json({
        hasClaude: !!keys.claudeKey,
        hasGemini: !!keys.geminiKey,
      });
    }
  }

  // Fallback: load from GitHub and restore cookie
  const fileHash = hashEmail(email);
  const file = await ghGetFile(`registry/.keys/${fileHash}.enc`);
  if (file) {
    const ciphertext = file.content.trim();
    const keys = decryptKeys(ciphertext, email);
    if (keys) {
      const response = NextResponse.json({
        hasClaude: !!keys.claudeKey,
        hasGemini: !!keys.geminiKey,
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
  }

  return NextResponse.json({ hasClaude: false, hasGemini: false });
}
