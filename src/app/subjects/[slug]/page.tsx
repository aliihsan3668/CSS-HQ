import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import {
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  ShieldCheck,
  Zap,
  MessageCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { getSubjectBySlug, getAllSubjects } from "@/lib/subjects";
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
import { SubjectBuyBar } from "@/components/subjects/subject-buy-bar";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) return { title: "Subject not found — CSS HQ" };
  return {
    title: `${subject.name} — CSS HQ`,
    description: subject.shortDesc,
  };
}

export async function generateStaticParams() {
  const subjects = await getAllSubjects();
  return subjects.map((s) => ({ slug: s.slug }));
}

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

const LIKELIHOOD_META: Record<
  string,
  { label: string; className: string }
> = {
  high: { label: "High likelihood", className: "likelihood-high" },
  medium: { label: "Medium likelihood", className: "likelihood-medium" },
  low: { label: "Low likelihood", className: "likelihood-low" },
};

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const Icon: LucideIcon = (Icons as any)[subject.iconKey] || BookOpen;
  const accent = ACCENT_MAP[subject.accentColor] || ACCENT_MAP.emerald;
  const isCompulsory = subject.category === "COMPULSORY";

  const samples = subject.samples.slice(0, 3);
  const pastPapersRange =
    subject.pastPapersFrom && subject.pastPapersTo
      ? `${subject.pastPapersFrom}–${subject.pastPapersTo}`
      : subject.pastPapersFrom
        ? `${subject.pastPapersFrom}–now`
        : "—";

  const stats = [
    {
      label: "Questions",
      value: subject.questionsCount,
      icon: HelpCircle,
    },
    {
      label: "Model answers",
      value: subject.answersCount,
      icon: CheckCircle2,
    },
    {
      label: "MCQs",
      value: subject.mcqsCount,
      icon: FileText,
    },
    {
      label: "Past papers",
      value: pastPapersRange,
      icon: BookOpen,
      isText: true,
    },
  ];

  // Top bullets for the sticky pricing card
  const pricingBullets = subject.features.slice(0, 4);
  const fallbackBullets = [
    "Color-coded most-likely questions",
    "Full model answers",
    "MCQ bank + past paper analysis",
    "Lifetime access + free updates",
  ];
  const bullets = pricingBullets.length > 0 ? pricingBullets : fallbackBullets;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: subject.name,
    description: subject.shortDesc,
    category: isCompulsory ? "Compulsory" : "Optional",
    brand: { "@type": "Brand", name: "CSS HQ" },
    offers: {
      "@type": "Offer",
      price: subject.pricePkr,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                <Link href="/subjects">Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero header */}
            <Card className="overflow-hidden border-0 ring-1 ring-border shadow-sm">
              <div className="bg-brand-gradient h-2" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "size-16 sm:size-20 rounded-2xl grid place-items-center shrink-0",
                      accent.bg
                    )}
                  >
                    <Icon
                      className={cn("size-8 sm:size-10", accent.text)}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
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
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Star className="size-3 text-gold" /> 95% exam coverage
                      </span>
                    </div>
                    <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                      {subject.name}
                    </h1>
                    <p className="mt-2 text-muted-foreground text-sm sm:text-base">
                      {subject.shortDesc}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                        {formatPkr(subject.pricePkr)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        one-time · lifetime access
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-5" />

                <SubjectBuyBar subject={subject} variant="hero" />
              </CardContent>
            </Card>

            {/* What's included */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-gold" />
                  What&apos;s included
                </CardTitle>
                <CardDescription>
                  Everything you get with this subject — straight from the
                  examiner&apos;s pattern.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subject.features.length > 0 ? (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {subject.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm rounded-lg bg-muted/40 p-3"
                      >
                        <Check
                          className="size-4 shrink-0 mt-0.5 text-primary"
                          strokeWidth={3}
                        />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Features will be listed here.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat) => {
                const SIcon = stat.icon;
                const isEmpty = !stat.isText && (stat.value === 0 || stat.value === "—");
                return (
                  <Card key={stat.label} className="border-0 ring-1 ring-border">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div
                        className={cn(
                          "size-9 rounded-lg grid place-items-center mb-2",
                          isEmpty
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <SIcon className="size-4" />
                      </div>
                      <span className="text-xl font-extrabold leading-none">
                        {isEmpty ? "—" : stat.value}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium mt-1">
                        {stat.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Sample preview questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="size-4 text-primary" />
                  Sample preview questions
                </CardTitle>
                <CardDescription>
                  A free peek — color-coded by likelihood. Full list inside.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {samples.length > 0 ? (
                  <ul className="space-y-3">
                    {samples.map((sample, i) => {
                      const meta =
                        LIKELIHOOD_META[sample.likelihood] ||
                        LIKELIHOOD_META.medium;
                      return (
                        <li
                          key={i}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium leading-relaxed">
                              <span className="text-muted-foreground mr-1.5">
                                Q{i + 1}.
                              </span>
                              {sample.q}
                            </p>
                            <span
                              className={cn(
                                "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                                meta.className
                              )}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sample questions will be added soon.
                  </p>
                )}

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg bg-secondary/50 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      Want the rest? Get full access →
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All questions, full model answers, MCQ bank, and past
                      papers — instantly after verification.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-brand-gradient hover:opacity-90 shrink-0"
                  >
                    <Link href="/#pricing">
                      Get full access
                      <ArrowRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Long description */}
            {subject.longDesc && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="size-4 text-primary" />
                    About this subject
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <p className="text-foreground/90 leading-relaxed text-sm sm:text-base">
                      {subject.longDesc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column — sticky pricing + trust */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Sticky pricing card */}
              <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                <div className="bg-brand-gradient h-1.5" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Price</span>
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-primary">
                      {formatPkr(subject.pricePkr)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      one-time
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/90"
                      >
                        <Check
                          className="size-4 shrink-0 mt-0.5 text-primary"
                          strokeWidth={3}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5">
                    <SubjectBuyBar subject={subject} variant="card" />
                  </div>

                  <Separator className="my-4" />

                  <a
                    href="https://wa.me/923085202620"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-border py-2.5 px-3 hover:bg-muted/50"
                  >
                    <MessageCircle className="size-4 text-emerald-600" />
                    WhatsApp support
                  </a>
                </CardContent>
              </Card>

              {/* Trust badges */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <TrustBadge
                    icon={ShieldCheck}
                    title="Verified seller"
                    sub="Run by Ali Ihsan, +92 308 5202620"
                  />
                  <TrustBadge
                    icon={Zap}
                    title="Instant access after verification"
                    sub="Manual payment verification — usually within minutes."
                  />
                  <TrustBadge
                    icon={Sparkles}
                    title="Lifetime access + free updates"
                    sub="Re-download anytime. Updates included forever."
                  />
                </CardContent>
              </Card>

              {/* Back to browse */}
              <Button asChild variant="ghost" className="w-full">
                <Link href="/subjects">
                  <ArrowRight className="size-4 mr-1.5 rotate-180" />
                  Back to all subjects
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  title,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
