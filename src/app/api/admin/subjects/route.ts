import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const subjects = await db.subject.findMany({
    orderBy: { order: "asc" },
    include: { pdfs: { select: { id: true, title: true, fileSize: true } } },
  });
  return NextResponse.json({ subjects });
}
