import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldCheck,
  Sparkles,
  Download,
  FileText,
  ShoppingCart,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPkr } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PdfViewer } from "@/components/dashboard/pdf-viewer";

export const dynamic = "force-dynamic";

const ACCENT_MAP: Record<string, { bg: string; text: string }> = {
  emerald: {
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary",
  },
  amber: {
    bg: "bg-gold/15 dark:bg-gold/20",
    text: "text-gold",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = await db.subject.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!subject) return { title: "Subject not found — CSS HQ" };
  return {
    title: `${subject.name} — Your Notes · CSS HQ`,
    description: `Read your purchased notes for ${subject.name}.`,
  };
}

export default async function SubjectViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const subject = await db.subject.findUnique({
    where: { slug },
    include: {
      pdfs: {
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, fileSize: true },
      },
    },
  });

  if (!subject) notFound();

  // Check ownership (admin bypasses)
  const isAdmin = user.role === "ADMIN";
  let purchase: { id: string; createdAt: Date } | null = null;
  if (!isAdmin) {
    purchase = await db.purchase.findUnique({
      where: {
        userId_subjectId: { userId: user.id, subjectId: subject.id },
      },
      select: { id: true, createdAt: true },
    });
  }

  const Icon: React.ElementType =
    (Icons as any)[subject.iconKey] || Icons.BookOpen;
  const accent = ACCENT_MAP[subject.accentColor] || ACCENT_MAP.emerald;
  const isCompulsory = subject.category === "COMPULSORY";
  const purchased = !!purchase || isAdmin;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "size-14 rounded-2xl grid place-items-center shrink-0",
                accent.bg
              )}
            >
              <Icon className={cn("size-7", accent.text)} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {subject.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    isCompulsory
                      ? "border-primary/30 text-primary bg-primary/5"
                      : "border-gold/40 text-gold bg-gold/10"
                  )}
                >
                  {isCompulsory ? "Compulsory" : "Optional"}
                </Badge>
                {purchased && (
                  <Badge
                    variant="outline"
                    className="font-medium border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                  >
                    <ShieldCheck className="size-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {subject.shortDesc}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 -ml-2 sm:ml-0">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1.5" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        {!purchased ? (
          <LockedState
            subjectId={subject.id}
            subjectName={subject.name}
            slug={subject.slug}
            pricePkr={subject.pricePkr}
            Icon={Icon}
            accent={accent}
          />
        ) : subject.pdfs.length === 0 ? (
          <NoPdfsState subjectName={subject.name} />
        ) : (
          <>
            {/* Privacy notice */}
            <div className="mt-6 rounded-xl bg-muted/40 p-4 flex items-start gap-3">
              <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  This content is for your personal use only.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sharing, reselling, or redistributing these notes is not
                  permitted and may result in your access being revoked.
                </p>
              </div>
            </div>

            {/* PDF viewer (handles single + multi) */}
            <div className="mt-6">
              <PdfViewer
                subjectId={subject.id}
                subjectName={subject.name}
                pdfs={subject.pdfs}
              />
            </div>

            {/* Quick links */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Card className="border-0 ring-1 ring-border">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">All your notes</p>
                    <p className="text-xs text-muted-foreground">
                      Jump back to the dashboard.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">
                      Dashboard
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 ring-1 ring-border">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-gold/15 grid place-items-center shrink-0">
                    <ShoppingCart className="size-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Want more subjects?</p>
                    <p className="text-xs text-muted-foreground">
                      Browse all 12 CSS subjects.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/subjects">
                      Browse
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Separator className="my-8" />
      </div>
    </div>
  );
}

/* ---------- states ---------- */

function LockedState({
  subjectId: _subjectId,
  subjectName,
  slug,
  pricePkr,
  Icon,
  accent,
}: {
  subjectId: string;
  subjectName: string;
  slug: string;
  pricePkr: number;
  Icon: React.ElementType;
  accent: { bg: string; text: string };
}) {
  return (
    <Card className="mt-6 border-dashed border-2 overflow-hidden">
      <div className="h-1.5 bg-brand-gradient" />
      <CardContent className="py-12 px-6 text-center">
        <div
          className={cn(
            "size-16 rounded-2xl grid place-items-center mx-auto mb-4",
            accent.bg
          )}
        >
          <Lock className={cn("size-8", accent.text)} strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold">
          You haven&apos;t unlocked {subjectName} yet
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
          Purchase this subject to instantly access all PDFs — color-coded
          questions, full model answers, MCQs, and past paper analysis.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="bg-brand-gradient hover:opacity-90">
            <Link href={`/subjects/${slug}`}>
              <Sparkles className="size-4 mr-1.5" />
              Unlock for {formatPkr(pricePkr)}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1.5" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NoPdfsState({ subjectName }: { subjectName: string }) {
  return (
    <Card className="mt-6 border-dashed border-2">
      <CardContent className="py-12 px-6 text-center">
        <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto mb-4">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Notes are being prepared</h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
          You&apos;ve unlocked <strong>{subjectName}</strong>, but the PDF
          hasn&apos;t been uploaded yet. We&apos;re working on it — please check
          back soon or reach out via WhatsApp.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline">
            <a
              href="https://wa.me/923085202620"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="size-4 mr-1.5" />
              Ask about this subject
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1.5" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
