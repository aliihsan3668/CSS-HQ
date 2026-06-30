import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { getAllSubjects } from "@/lib/subjects";
import { getActivePricing } from "@/lib/settings";
import { formatPkr } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubjectCard } from "@/components/subjects/subject-card";
import { BundleBanner } from "@/components/subjects/bundle-banner";
import { FullBundleHero } from "@/components/subjects/full-bundle-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Notes — CSS HQ",
  description:
    "Browse all 12 CSS exam subjects — 6 compulsory, 6 optional. Per-subject notes, bundles, and the full bundle with launch pricing.",
};

export default async function SubjectsBrowsePage() {
  const [subjects, pricing] = await Promise.all([
    getAllSubjects(),
    getActivePricing(),
  ]);

  const compulsory = subjects.filter((s) => s.category === "COMPULSORY");
  const optional = subjects.filter((s) => s.category === "OPTIONAL");

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb-like nav */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Browse Notes</span>
        </nav>

        {/* Page header */}
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <BookOpen className="size-3.5" />
            All subjects
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Browse <span className="text-gradient-brand">Notes</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">
            12 exam-focused subjects — 6 compulsory, 6 optional. Buy individually
            or save with a bundle. Every subject ships with color-coded
            most-likely questions, full model answers, MCQ banks, and 2016–2025
            past paper analysis.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 font-medium"
            >
              {compulsory.length} Compulsory
            </Badge>
            <Badge
              variant="outline"
              className="border-gold/40 text-gold bg-gold/10 font-medium"
            >
              {optional.length} Optional
            </Badge>
            <Badge variant="outline" className="font-medium">
              {subjects.length} total
            </Badge>
          </div>
        </header>

        {/* Full Bundle hero banner */}
        <section className="mt-8" aria-label="Full bundle offer">
          <FullBundleHero
            launchEnabled={pricing.launchEnabled}
            launchBundle={pricing.launchBundle}
            fullBundle={pricing.fullBundle}
          />
        </section>

        {/* Tabs with subject cards + bundle banners */}
        <Tabs defaultValue="compulsory" className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-auto">
              <TabsTrigger value="compulsory" className="py-2.5">
                Compulsory ({compulsory.length})
              </TabsTrigger>
              <TabsTrigger value="optional" className="py-2.5">
                Optional ({optional.length})
              </TabsTrigger>
            </TabsList>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {formatPkr(pricing.perSubject)} per subject · Bundles save more
            </p>
          </div>

          <TabsContent value="compulsory" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {compulsory.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
            <BundleBanner
              id="bundle-compulsory"
              title="Compulsory Bundle"
              subtitle="All 6 compulsory subjects — Current Affairs, Essay, GSA, Islamic Studies, Pakistan Affairs, Precis & Composition."
              price={pricing.compulsoryBundle}
              perSubjectPrice={pricing.perSubject}
              count={6}
              accent="brand"
            />
          </TabsContent>

          <TabsContent value="optional" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {optional.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
            <BundleBanner
              id="bundle-optional"
              title="Optional Bundle"
              subtitle="All 6 optional subjects — Gender Studies, Criminology, USA History, IR Paper 1, IR Paper 2, Public Administration."
              price={pricing.optionalBundle}
              perSubjectPrice={pricing.perSubject}
              count={6}
              accent="brand"
            />
          </TabsContent>
        </Tabs>

        {/* Bottom note */}
        <div className="mt-12 rounded-xl border border-dashed border-border bg-secondary/40 p-5 sm:p-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="size-4 text-gold" />
            Want just one subject? Pick from the tabs above.{" "}
            <span className="font-bold text-foreground">
              {formatPkr(pricing.perSubject)}
            </span>{" "}
            each.
          </div>
        </div>

        {/* Help CTA */}
        <div className="mt-6 flex justify-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/#faq">Need help choosing? See FAQ →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
