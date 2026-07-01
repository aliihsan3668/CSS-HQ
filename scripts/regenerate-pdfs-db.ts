import { db } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

function makePdf(title: string, body: string): Buffer {
  const lines = body.split("\n");
  const contentStream = `BT\n/F1 24 Tf\n72 720 Td\n(${escapePdfString(title)}) Tj\n/F1 12 Tf\n0 -36 Td\n${lines
    .map((l) => `(${escapePdfString(l)}) Tj\n0 -18 Td\n`)
    .join("")}ET`;

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>"
  );
  objects.push(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

function escapePdfString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

async function main() {
  console.log("Cleaning up old SubjectPdf rows...");
  const deleted = await db.subjectPdf.deleteMany({});
  console.log(`✓ Deleted ${deleted.count} old PDF rows`);

  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });
  console.log(`\nGenerating ${subjects.length} placeholder PDFs in database...`);

  for (const s of subjects) {
    const body = [
      `Subject: ${s.name}`,
      `Category: ${s.category}`,
      ``,
      `Questions: ${s.questionsCount}`,
      `Model Answers: ${s.answersCount}`,
      `MCQs: ${s.mcqsCount}`,
      `Past Papers: ${s.pastPapersFrom}–${s.pastPapersTo}`,
      ``,
      `---`,
      ``,
      `This is a PLACEHOLDER PDF stored in the database.`,
      ``,
      `Ali — replace this with your real notes PDF via the admin panel:`,
      `Admin → Subjects → ${s.name} → Upload PDF`,
      ``,
      `Features of ${s.name}:`,
      ...JSON.parse(s.featuresJson || "[]").map((f: string) => `  • ${f}`),
      ``,
      `Sample preview questions:`,
      ...JSON.parse(s.sampleJson || "[]").map(
        (q: any, i: number) => `  ${i + 1}. [${q.likelihood.toUpperCase()}] ${q.q}`
      ),
      ``,
      `CSS HQ — Premium CSS Exam Notes`,
      `aliihsan.devs@gmail.com · +92 308 5202620`,
    ].join("\n");

    const buf = makePdf(`${s.name} — CSS HQ`, body);
    const uploaded = await uploadFile(`${s.slug}-notes.pdf`, buf, "application/pdf");

    const pdf = await db.subjectPdf.create({
      data: {
        subjectId: s.id,
        title: `${s.name} — Full Notes (placeholder)`,
        storageKey: "db:pending",
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
    console.log(`✓ ${s.name} (${buf.length} bytes → DB)`);
  }

  console.log("\n=== DONE ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});