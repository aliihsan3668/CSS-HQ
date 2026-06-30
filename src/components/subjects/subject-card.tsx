"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubjectPublic } from "@/lib/subjects";
import { FileText, HelpCircle, CheckCircle2, ShoppingCart, Plus } from "lucide-react";

const ACCENT_MAP: Record<string, { bg: string; ring: string; text: string }> = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    ring: "ring-emerald-200/60 dark:ring-emerald-800/50",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    ring: "ring-amber-200/60 dark:ring-amber-800/50",
    text: "text-amber-700 dark:text-amber-500",
  },
};

export function SubjectCard({ subject }: { subject: SubjectPublic }) {
  const Icon = (Icons as any)[subject.iconKey] || Icons.BookOpen;
  const accent = ACCENT_MAP[subject.accentColor] || ACCENT_MAP.emerald;
  const { add, has } = useCart();
  const inCart = has(subject.slug);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 ring-1 transition-all hover:shadow-card-hover hover:-translate-y-1",
        accent.ring,
        "bg-card"
      )}
    >
      {/* gradient header strip */}
      <div className="h-1.5 bg-brand-gradient" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("size-12 rounded-xl grid place-items-center", accent.bg)}>
            <Icon className={cn("size-6", accent.text)} strokeWidth={2} />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              subject.category === "COMPULSORY"
                ? "border-primary/30 text-primary bg-primary/5"
                : "border-gold/40 text-gold bg-gold/10"
            )}
          >
            {subject.category === "COMPULSORY" ? "Compulsory" : "Optional"}
          </Badge>
        </div>

        <h3 className="mt-4 font-bold text-base leading-tight line-clamp-2">
          {subject.name}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {subject.shortDesc}
        </p>

        {/* Stat row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat
            value={subject.questionsCount}
            label="Questions"
            icon={<HelpCircle className="size-3" />}
          />
          <Stat
            value={subject.answersCount}
            label="Answers"
            icon={<CheckCircle2 className="size-3" />}
          />
          <Stat
            value={subject.mcqsCount}
            label="MCQs"
            icon={<FileText className="size-3" />}
          />
        </div>

        {/* Price + actions */}
        <div className="mt-5 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Price
            </p>
            <p className="font-extrabold text-lg text-foreground">
              {formatPkr(subject.pricePkr)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant={inCart ? "secondary" : "outline"}
              onClick={() =>
                add({
                  type: "subject",
                  id: subject.slug,
                  title: subject.name,
                  pricePkr: subject.pricePkr,
                })
              }
              disabled={inCart}
              className="h-9"
            >
              {inCart ? (
                <>
                  <CheckCircle2 className="size-3.5 mr-1" /> Added
                </>
              ) : (
                <>
                  <Plus className="size-3.5 mr-1" /> Add
                </>
              )}
            </Button>
            <Button
              size="sm"
              asChild
              className="h-9 bg-brand-gradient hover:opacity-90"
            >
              <Link href={`/subjects/${subject.slug}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  if (value === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-2">
        <div className="flex items-center justify-center gap-1 text-muted-foreground">
          {icon}
          <span className="text-sm font-bold">—</span>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{label}</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <div className="flex items-center justify-center gap-1 text-primary">
        {icon}
        <span className="text-sm font-bold">{value}</span>
      </div>
      <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{label}</p>
    </div>
  );
}
