import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readFileBytes } from "@/lib/storage";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = await readFileBytes(key);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mime = key.includes(".pdf")
    ? "application/pdf"
    : file.mimeType || "application/octet-stream";

  return new NextResponse(file.data as any, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, no-store",
      "Content-Length": String(file.data.length),
    },
  });
}
