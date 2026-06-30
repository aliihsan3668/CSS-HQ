import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readFileBytes } from "@/lib/storage";

// Proxy to serve a stored file (blob or local) by storageKey.
// Used for receipts (admin-only) and protected preview images.
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  // Receipts should only be viewable by admin
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    // Allow non-admin only if it's a non-receipt file (e.g. logo). For safety, restrict.
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = await readFileBytes(key);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mime = key.endsWith(".pdf")
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
