"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Ayesha K.",
    role: "CSS 2024 aspirant",
    initials: "AK",
    quote:
      "The color-coded likelihood system saved me weeks. I knew exactly which 25 questions to memorize for Pakistan Affairs — and 3 of them showed up in the exam.",
    rating: 5,
  },
  {
    name: "Hamza R.",
    role: "Cleared written exam",
    initials: "HR",
    quote:
      "Bought the full bundle. The MCQ banks alone are worth the price. The Islamic Studies 207-MCQ bank covered nearly every objective question in the actual paper.",
    rating: 5,
  },
  {
    name: "Sana M.",
    role: "Gender Studies optional",
    initials: "SM",
    quote:
      "I was completely lost before these notes. The 22 guaranteed questions were my entire prep strategy. Felt so confident walking into the exam hall.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            From aspirants, by an aspirant
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built by someone who{" "}
            <span className="text-gradient-brand">walked the same path.</span>
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="size-4 fill-gold text-gold"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <Quote className="size-6 text-primary/30 mb-2" />
                  <p className="text-sm leading-relaxed text-foreground/90">
                    "{t.quote}"
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarFallback className="bg-brand-gradient text-white text-xs font-bold">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
