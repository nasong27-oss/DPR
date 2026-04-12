import crypto from "node:crypto";

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);
}

function deriveKey(email: string): Buffer {
  return Buffer.from(
    crypto.hkdfSync(
      "sha256",
      Buffer.from(process.env.NEXTAUTH_SECRET!, "utf8"),
      Buffer.alloc(32),
      Buffer.from(`pm-hub-keys:${email}`, "utf8"),
      32
    )
  );
}

export function encryptKeys(
  payload: { claudeKey: string; geminiKey: string },
  email: string
): string {
  const key = deriveKey(email);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString("base64url");
}

export function decryptKeys(
  token: string,
  email: string
): { claudeKey: string; geminiKey: string } | null {
  try {
    const key = deriveKey(email);
    const buf = Buffer.from(token, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(buf.length - 16);
    const enc = buf.subarray(12, buf.length - 16);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return JSON.parse(
      Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8")
    );
  } catch {
    return null;
  }
}
