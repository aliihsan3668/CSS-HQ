"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Pick your subjects (or bundle)",
    desc: "Browse the 12-subject catalog. Add individual subjects at 1,500 PKR or save big with a bundle.",
  },
  {
    n: "2",
    title: "Pay with your favorite method",
    desc: "JazzCash, EasyPaisa, NayaPay, SadaPay, or Payoneer — pay the exact amount to the account shown at checkout.",
  },
  {
    n: "3",
    title: "Upload a payment screenshot",
    desc: "Snap a screenshot of your payment confirmation and upload it. Add any transaction ID for faster verification.",
  },
  {
    n: "4",
    title: "Get instant access after verification",
    desc: "Usually within 5–10 minutes during the day. You'll get an email and your notes will be unlocked in your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            From signup to studying in{" "}
            <span className="text-gradient-brand">under 10 minutes.</span>
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative"
            >
              <div className="rounded-2xl border bg-card p-6 h-full hover:shadow-card-hover transition-shadow">
                <div className="size-12 rounded-xl bg-brand-gradient grid place-items-center text-white font-extrabold text-lg shadow-brand">
                  {s.n}
                </div>
                <h3 className="mt-4 font-bold text-base">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-primary/30 z-10">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="https://wa.me/923085202620"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="size-4" />
            Have a question before buying? WhatsApp us.
          </Link>
          <span className="hidden sm:inline text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            Verified seller · Real human support
          </span>
        </div>
      </div>
    </section>
  );
}
