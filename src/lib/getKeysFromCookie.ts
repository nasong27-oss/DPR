import { cookies } from "next/headers";
import { decryptKeys } from "./crypto";

export async function getKeysFromCookie(
  email: string
): Promise<{ claudeKey: string; geminiKey: string } | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("pm_hub_keys")?.value;
  if (!token) return null;
  return decryptKeys(token, email);
}
