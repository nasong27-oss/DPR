import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("pdf") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be PDF" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Dynamic import to avoid build issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse: (buffer: Buffer) => Promise<{ text: string; numpages: number; info: unknown }> =
    (await import("pdf-parse") as any).default ?? (await import("pdf-parse") as any);
  const data = await pdfParse(buffer);

  return NextResponse.json({
    text: data.text,
    pages: data.numpages,
    info: data.info,
  });
}
