"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, ArrowRight, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";

interface FullBundleHeroProps {
  launchEnabled: boolean;
  launchBundle: number;
  fullBundle: number;
}

export function FullBundleHero({
  launchEnabled,
  launchBundle,
  fullBundle,
}: FullBundleHeroProps) {
  const { add, has } = useCart();
  const added = has("bundle-full");
  const price = launchEnabled ? launchBundle : fullBundle;
  const originalPrice = launchEnabled ? fullBundle : 1500 * 12;
  const savings = originalPrice - price;
  const title = launchEnabled
    ? "Full Bundle — Launch Price (12 subjects)"
    : "Full Bundle (12 subjects)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-2 border-gold/40 shadow-xl">
        <div className="bg-gold-gradient p-1.5" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="size-16 rounded-2xl bg-gold/20 grid place-items-center shrink-0">
              <Crown className="size-8 text-gold" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  The <span className="text-gradient-gold">Full Bundle</span>
                </h2>
                {launchEnabled && (
                  <Badge className="bg-gold-gradient text-white border-0 shadow-sm">
                    <Sparkles className="size-3 mr-1" /> Launch offer
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                All 12 subjects — every question, answer, MCQ bank, and 2016–2025
                past paper analysis. 95% exam coverage guarantee, priority
                WhatsApp support, lifetime access + free updates.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[
                  "All 12 subjects",
                  "95% coverage",
                  "Lifetime access",
                  "Free updates",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-medium text-foreground/80 bg-muted/60 px-2 py-1 rounded-md"
                  >
                    <Check className="size-3 text-gold" strokeWidth={3} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 lg:border-l lg:pl-8 lg:border-border">
              <div className="flex items-baseline gap-2 flex-wrap lg:justify-end">
                <span className="text-3xl sm:text-4xl font-extrabold text-gradient-gold">
                  {formatPkr(price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPkr(originalPrice)}
                </span>
              </div>
              <Badge className="bg-gold/20 text-gold border-gold/30 -ml-1 lg:ml-0">
                Save {formatPkr(savings)}
              </Badge>
              <Button
                size="lg"
                onClick={() =>
                  add({
                    type: "bundle",
                    id: "bundle-full",
                    title,
                    pricePkr: price,
                  })
                }
                disabled={added}
                className="bg-gold-gradient hover:opacity-90 text-white w-full lg:w-auto mt-1"
              >
                {added ? (
                  <>
                    <Check className="size-4 mr-1.5" /> Added to cart
                  </>
                ) : (
                  <>
                    Add Full Bundle to cart
                    <ArrowRight className="size-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
