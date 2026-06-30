"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 sm:p-14 text-center"
        >
          <div className="absolute inset-0 bg-dots opacity-20" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold mb-5">
              <Clock className="size-3.5" />
              Launch offer ends soon
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Stop preparing randomly.
              <br />
              Start preparing to win.
            </h2>
            <p className="mt-5 text-white/90 text-lg max-w-2xl mx-auto">
              The next CSS attempt is closer than you think. With 95% exam
              coverage and a guaranteed-question system, you can walk in knowing
              exactly what to expect.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-bold"
              >
                <Link href="/subjects">
                  Get the Full Bundle
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-base"
              >
                <Link href="#pricing">See all pricing</Link>
              </Button>
            </div>
            <p className="mt-6 text-white/80 text-sm">
              <Sparkles className="size-3.5 inline mr-1" />
              Full bundle at 8,999 PKR (launch price) — saves you 2,001 PKR.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
