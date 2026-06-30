"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STATS = [
  { value: "95%", label: "Exam Coverage", sub: "guaranteed" },
  { value: "12", label: "Subjects", sub: "compulsory + optional" },
  { value: "2,400+", label: "MCQs", sub: "across all subjects" },
  { value: "10 yrs", label: "Past Papers", sub: "2016–2025" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"
        aria-hidden
      />
      <div
        className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-5 bg-gold/15 text-gold border-gold/30 hover:bg-gold/20">
              <Sparkles className="size-3.5 mr-1" />
              Launch offer — Full bundle at 8,999 PKR
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              The CSS prep notes that{" "}
              <span className="text-gradient-brand">actually cover the exam.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              12 subjects. Color-coded most-likely questions. Full model answers.
              Comprehensive MCQ banks. Past papers 2016–2025 with deep analysis.
              Built by a top scorer — 95% of exam questions come from these notes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-gradient hover:opacity-90 shadow-brand text-base h-12 px-7"
              >
                <Link href="/subjects">
                  Browse Notes
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base h-12 px-7"
              >
                <Link href="#pricing">See Pricing</Link>
              </Button>
            </div>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> Verified seller
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" /> Instant access after verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-4 text-primary" /> Pay with JazzCash, EasyPaisa, NayaPay & more
              </span>
            </div>
          </motion.div>

          {/* Right: visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl bg-card border shadow-xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-gradient opacity-20 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Most Likely Question
                    </p>
                    <p className="font-bold text-lg">Pakistan Affairs</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full likelihood-high">
                    HIGH PROBABILITY
                  </span>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-sm leading-relaxed">
                    Critically analyze the role of Sir Syed Ahmad Khan in the
                    renaissance of Muslims of the subcontinent.
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">50</p>
                    <p className="text-muted-foreground">Questions</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">34</p>
                    <p className="text-muted-foreground">Answers</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">250</p>
                    <p className="text-muted-foreground">MCQs</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[95%] bg-brand-gradient rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-primary">95% covered</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 sm:-left-6 bg-card border rounded-2xl shadow-lg p-3 flex items-center gap-3 max-w-[200px]"
            >
              <div className="size-10 rounded-full bg-gold/20 grid place-items-center">
                <Sparkles className="size-5 text-gold" />
              </div>
              <div>
                <p className="text-xs font-bold">Guaranteed list</p>
                <p className="text-[10px] text-muted-foreground">
                  25 condensed, must-know questions
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border bg-card p-5 text-center hover:shadow-card-hover transition-shadow"
            >
              <p className="text-3xl font-extrabold text-gradient-brand">{s.value}</p>
              <p className="mt-1 font-semibold text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
