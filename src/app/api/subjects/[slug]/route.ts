import { NextResponse } from "next/server";
import { getSubjectBySlug } from "@/lib/subjects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }
  return NextResponse.json({ subject });
}
