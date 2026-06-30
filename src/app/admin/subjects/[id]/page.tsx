import Link from "next/link";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Upload,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPkr } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubjectEditForm } from "@/components/admin/subject-edit-form";
import { PdfUpload } from "@/components/admin/pdf-upload";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage subject · Admin · CSS HQ",
};

export default async function AdminSubjectManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const { id } = await params;
  const subject = await db.subject.findUnique({
    where: { id },
    include: {
      pdfs: {
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, fileSize: true, createdAt: true },
      },
      _count: { select: { purchases: true } },
    },
  });
  if (!subject) notFound();

  const Icon =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[subject.iconKey] ||
    BookOpen;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/subjects">
            <ArrowLeft className="size-4" />
            Back to subjects
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={
                "size-12 rounded-xl grid place-items-center shrink-0 " +
                (subject.accentColor === "amber" || subject.accentColor === "gold"
                  ? "bg-gold/15 text-gold"
                  : "bg-primary/10 text-primary")
              }
            >
              <Icon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {subject.name}
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {subject.category.toLowerCase()}
                </Badge>
                {subject.isActive ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                  >
                    <Eye className="size-3" />
                    active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-muted text-muted-foreground"
                  >
                    <EyeOff className="size-3" />
                    hidden
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatPkr(subject.pricePkr)} ·{" "}
                {subject.pdfs.length} PDF
                {subject.pdfs.length === 1 ? "" : "s"} ·{" "}
                {subject._count.purchases} buyer
                {subject._count.purchases === 1 ? "" : "s"} ·{" "}
                <span className="font-mono">/subjects/{subject.slug}</span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/subjects/${subject.slug}`}>
              <ExternalLink className="size-3.5" />
              View on site
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px] items-start">
        {/* Edit form */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Subject details
            </CardTitle>
            <CardDescription>
              Edit the fields below and click Save. Changes go live immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <SubjectEditForm
              subjectId={subject.id}
              initial={{
                name: subject.name,
                shortDesc: subject.shortDesc,
                longDesc: subject.longDesc,
                iconKey: subject.iconKey,
                accentColor: subject.accentColor,
                pricePkr: subject.pricePkr,
                questionsCount: subject.questionsCount,
                answersCount: subject.answersCount,
                mcqsCount: subject.mcqsCount,
                isActive: subject.isActive,
              }}
            />
          </CardContent>
        </Card>

        {/* PDFs section */}
        <div className="space-y-4 lg:sticky lg:top-32">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                PDFs
              </CardTitle>
              <CardDescription>
                Upload the actual notes files buyers get access to.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PdfUpload subjectId={subject.id} pdfs={subject.pdfs} />
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="size-9 rounded-md bg-brand-gradient/10 grid place-items-center shrink-0">
                <GraduationCap className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Buyer access</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {subject._count.purchases} student
                  {subject._count.purchases === 1 ? "" : "s"} currently have
                  access to this subject&apos;s PDFs. PDFs you upload here are
                  immediately available to them through the protected download route.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="size-3.5" />
            Max PDF size: 25 MB. Files are stored{" "}
            {process.env.BLOB_READ_WRITE_TOKEN
              ? "in Vercel Blob"
              : "locally in /public/uploads"}
            .
          </div>
        </div>
      </div>
    </div>
  );
}
