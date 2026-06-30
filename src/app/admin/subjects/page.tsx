import Link from "next/link";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import {
  BookOpen,
  Plus,
  FileText,
  ArrowRight,
  Eye,
  EyeOff,
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

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subjects · Admin · CSS HQ",
};

export default async function AdminSubjectsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const subjects = await db.subject.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
    include: {
      pdfs: { select: { id: true, fileSize: true } },
      _count: { select: { purchases: true } },
    },
  });

  const compulsory = subjects.filter((s) => s.category === "COMPULSORY");
  const optional = subjects.filter((s) => s.category === "OPTIONAL");

  function SubjectRow({
    subject,
  }: {
    subject: (typeof subjects)[number];
  }) {
    const Icon =
      (Icons as unknown as Record<string, Icons.LucideIcon>)[subject.iconKey] ||
      BookOpen;
    const accentBg =
      subject.accentColor === "amber"
        ? "bg-gold/15 text-gold"
        : subject.accentColor === "gold"
        ? "bg-gold/15 text-gold"
        : "bg-primary/10 text-primary";
    const totalPdfSize = subject.pdfs.reduce((acc, p) => acc + p.fileSize, 0);

    return (
      <Link
        href={`/admin/subjects/${subject.id}`}
        className="flex items-center gap-4 rounded-xl border p-4 hover:shadow-card-hover hover:border-primary/30 transition-all bg-card"
      >
        <div
          className={
            "size-11 rounded-xl grid place-items-center shrink-0 " + accentBg
          }
        >
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{subject.name}</h3>
            {!subject.isActive && (
              <Badge
                variant="outline"
                className="text-[10px] bg-muted text-muted-foreground"
              >
                <EyeOff className="size-3" />
                hidden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subject.shortDesc}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" />
              {subject.pdfs.length} PDF{subject.pdfs.length === 1 ? "" : "s"}
            </span>
            {totalPdfSize > 0 && (
              <span>
                ·{" "}
                {totalPdfSize > 1024 * 1024
                  ? `${(totalPdfSize / 1024 / 1024).toFixed(1)} MB`
                  : `${Math.round(totalPdfSize / 1024)} KB`}{" "}
                total
              </span>
            )}
            <span>· {subject._count.purchases} buyers</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-gradient-brand">
            {formatPkr(subject.pricePkr)}
          </span>
          <Button asChild size="sm" variant="ghost">
            <span className="inline-flex items-center gap-1 text-xs">
              Manage
              <ArrowRight className="size-3.5" />
            </span>
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subjects.length} subjects ·{" "}
            {subjects.filter((s) => s.isActive).length} active ·{" "}
            {subjects.filter((s) => !s.isActive).length} hidden
          </p>
        </div>
        <Button className="bg-brand-gradient hover:opacity-90" disabled>
          <Plus className="size-4" />
          New subject
        </Button>
      </div>

      {/* Compulsory */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <div>
              <CardTitle className="text-base">Compulsory subjects</CardTitle>
              <CardDescription>
                {compulsory.length} subjects — required for all CSS candidates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 pt-6">
          {compulsory.map((s) => (
            <SubjectRow key={s.id} subject={s} />
          ))}
        </CardContent>
      </Card>

      {/* Optional */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-gold" />
            <div>
              <CardTitle className="text-base">Optional subjects</CardTitle>
              <CardDescription>
                {optional.length} subjects — chosen by candidates based on background
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 pt-6">
          {optional.map((s) => (
            <SubjectRow key={s.id} subject={s} />
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="size-3.5" />
        Click any subject to edit its details, manage PDFs, or toggle visibility.
      </div>
    </div>
  );
}
