import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readFileBytes } from "@/lib/storage";

// Protected PDF download — only buyers (or admin) get bytes
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }
  const { subjectId } = await params;
  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    include: { pdfs: { orderBy: { createdAt: "asc" } } },
  });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  // Admin bypass
  if (user.role !== "ADMIN") {
    const purchase = await db.purchase.findUnique({
      where: { userId_subjectId: { userId: user.id, subjectId } },
    });
    if (!purchase) {
      return NextResponse.json(
        { error: "You have not purchased this subject." },
        { status: 403 }
      );
    }
  }

  const pdfIdParam = new URL(_req.url).searchParams.get("pdfId");
  let pdf = subject.pdfs[0];
  if (pdfIdParam) {
    const found = subject.pdfs.find((p) => p.id === pdfIdParam);
    if (found) pdf = found;
  }
  if (!pdf) {
    return NextResponse.json({ error: "No PDF available" }, { status: 404 });
  }

  const file = await readFileBytes(pdf.storageKey);
  if (!file) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  // Inline viewing with download fallback
  const filename = `${subject.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  return new NextResponse(file.data as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "Content-Length": String(file.data.length),
    },
  });
}
