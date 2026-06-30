import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

// GET single subject (admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const subject = await db.subject.findUnique({
    where: { id },
    include: { pdfs: true },
  });
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subject });
}

// PATCH — update subject fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const allowed = [
    "name",
    "shortDesc",
    "longDesc",
    "iconKey",
    "accentColor",
    "order",
    "pricePkr",
    "questionsCount",
    "answersCount",
    "mcqsCount",
    "isActive",
    "featuresJson",
    "sampleJson",
  ];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) data[k] = body[k];
  }
  const subject = await db.subject.update({ where: { id }, data });
  return NextResponse.json({ subject });
}

// DELETE subject
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const pdfs = await db.subjectPdf.findMany({ where: { subjectId: id } });
  for (const p of pdfs) {
    await deleteFile(p.storageKey).catch(() => {});
  }
  await db.subject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
