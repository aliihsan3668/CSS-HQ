"use client";

import { motion } from "framer-motion";
import {
  ListChecks,
  FileText,
  HelpCircle,
  CalendarDays,
  Palette,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    title: "Color-coded by likelihood",
    desc: "Every question is tagged High / Medium / Low probability based on past paper trends — so you know exactly what to focus on first.",
    color: "emerald",
  },
  {
    icon: Sparkles,
    title: "Condensed guaranteed lists",
    desc: "Smart 'must-know' condensed lists for each subject. If you only study these, you're already 80% there.",
    color: "gold",
  },
  {
    icon: ListChecks,
    title: "Detailed outlines",
    desc: "Every high-yield question comes with a structured outline so you can write a complete, exam-ready answer.",
    color: "emerald",
  },
  {
    icon: FileText,
    title: "Full model answers",
    desc: "Don't just know the question — see how a topper answers it. Complete model answers for the highest-yield questions.",
    color: "gold",
  },
  {
    icon: HelpCircle,
    title: "Massive MCQ banks",
    desc: "200–350 MCQs per subject, tiered by importance. Walk into the objective paper ready for anything.",
    color: "emerald",
  },
  {
    icon: CalendarDays,
    title: "10 years of past papers",
    desc: "2016–2025 past papers for every subject, with thorough subjective + objective analysis. Pattern recognition included.",
    color: "gold",
  },
  {
    icon: TrendingUp,
    title: "Past paper trend analysis",
    desc: "Not just the papers — a clear analysis of what's asked, how often, and what's due next.",
    color: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Topic-wise organization",
    desc: "Everything organized by topic, not random dumps. Find what you need in seconds, not minutes.",
    color: "gold",
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Why these notes work
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Everything you need.{" "}
            <span className="text-gradient-brand">Nothing you don't.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built around the CSS examiner's pattern. Every feature exists because
            it directly increases your chance of scoring higher.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="group rounded-2xl border bg-card p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all"
            >
              <div
                className={`size-11 rounded-xl grid place-items-center mb-4 ${
                  f.color === "emerald"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500"
                } group-hover:scale-110 transition-transform`}
              >
                <f.icon className="size-5" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-base leading-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
