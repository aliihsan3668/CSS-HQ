import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const subject = await db.subject.findUnique({ where: { id } });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Untitled";
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());

    let uploaded;
    try {
      uploaded = await uploadFile(file.name, buf, "application/pdf");
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "File storage failed" },
        { status: 500 }
      );
    }

    const pdf = await db.subjectPdf.create({
      data: {
        subjectId: id,
        title,
        storageKey: uploaded.source === "db" ? "db:pending" : uploaded.storageKey,
        source: uploaded.source,
        fileSize: uploaded.size,
        mimeType: "application/pdf",
        dataBytes: uploaded.source === "db" ? uploaded.data : null,
      },
    });

    if (uploaded.source === "db") {
      await db.subjectPdf.update({
        where: { id: pdf.id },
        data: { storageKey: `db:${pdf.id}` },
      });
    }

    return NextResponse.json({ pdf });
  } catch (e: any) {
    console.error("[pdf-upload] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");
    if (!pdfId) {
      return NextResponse.json({ error: "Missing pdfId" }, { status: 400 });
    }
    const pdf = await db.subjectPdf.findUnique({ where: { id: pdfId } });
    if (!pdf) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (pdf.source !== "db") {
      await deleteFile(pdf.storageKey).catch(() => {});
    }
    await db.subjectPdf.delete({ where: { id: pdfId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
