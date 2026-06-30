"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";
import Link from "next/link";

interface Props {
  pricing: {
    perSubject: number;
    compulsoryBundle: number;
    optionalBundle: number;
    fullBundle: number;
    launchBundle: number;
    launchEnabled: boolean;
  };
}

export function Pricing({ pricing }: Props) {
  const { add, has } = useCart();

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Simple, transparent pricing
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            One price. Lifetime access.{" "}
            <span className="text-gradient-brand">Free updates.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Buy per subject, or grab a bundle and save up to 33%. Pay locally
            via JazzCash, EasyPaisa, NayaPay, SadaPay, or Payoneer.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-4 gap-5">
          {/* Per Subject */}
          <PricingCard
            title="Per Subject"
            icon={Sparkles}
            price={pricing.perSubject}
            period="one-time"
            features={[
              "Any single subject",
              "All questions + answers for that subject",
              "Full MCQ bank",
              "2016–2025 past papers + analysis",
              "Lifetime access",
            ]}
            cta="Browse subjects"
            ctaHref="/subjects"
            onAdd={() => {}}
            accent="default"
          />

          {/* Compulsory Bundle */}
          <PricingCard
            title="Compulsory Bundle"
            icon={Check}
            price={pricing.compulsoryBundle}
            originalPrice={pricing.perSubject * 6}
            period="one-time"
            features={[
              "All 6 compulsory subjects",
              "Current Affairs, Essay, GSA, Islamic Studies,",
              "Pakistan Affairs, Precis & Composition",
              "Everything per-subject includes × 6",
              "Lifetime access + free updates",
            ]}
            cta="Add to cart"
            onAdd={() =>
              add({
                type: "bundle",
                id: "bundle-compulsory",
                title: "Compulsory Bundle (6 subjects)",
                pricePkr: pricing.compulsoryBundle,
              })
            }
            added={has("bundle-compulsory")}
            accent="default"
          />

          {/* Optional Bundle */}
          <PricingCard
            title="Optional Bundle"
            icon={Check}
            price={pricing.optionalBundle}
            originalPrice={pricing.perSubject * 6}
            period="one-time"
            features={[
              "All 6 optional subjects",
              "Gender Studies, Criminology, USA History,",
              "IR Paper 1, IR Paper 2, Public Administration",
              "Everything per-subject includes × 6",
              "Lifetime access + free updates",
            ]}
            cta="Add to cart"
            onAdd={() =>
              add({
                type: "bundle",
                id: "bundle-optional",
                title: "Optional Bundle (6 subjects)",
                pricePkr: pricing.optionalBundle,
              })
            }
            added={has("bundle-optional")}
            accent="default"
          />

          {/* Full Bundle (highlighted) */}
          <PricingCard
            title="Full Bundle"
            icon={Crown}
            price={pricing.launchEnabled ? pricing.launchBundle : pricing.fullBundle}
            originalPrice={pricing.launchEnabled ? pricing.fullBundle : pricing.perSubject * 12}
            period="one-time"
            features={[
              "All 12 subjects (compulsory + optional)",
              "Every question, answer, MCQ, past paper",
              "95% exam coverage guarantee",
              "Priority WhatsApp support",
              "Lifetime access + free updates",
            ]}
            cta={pricing.launchEnabled ? "Grab launch offer" : "Add to cart"}
            onAdd={() =>
              add({
                type: "bundle",
                id: "bundle-full",
                title: pricing.launchEnabled
                  ? "Full Bundle — Launch Price (12 subjects)"
                  : "Full Bundle (12 subjects)",
                pricePkr: pricing.launchEnabled
                  ? pricing.launchBundle
                  : pricing.fullBundle,
              })
            }
            added={has("bundle-full")}
            accent="highlight"
            launchBadge={pricing.launchEnabled}
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need help choosing?{" "}
          <a
            href="https://wa.me/923085202620"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            WhatsApp us
          </a>{" "}
          — we'll guide you.
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  title,
  icon: Icon,
  price,
  originalPrice,
  period,
  features,
  cta,
  ctaHref,
  onAdd,
  added,
  accent,
  launchBadge,
}: {
  title: string;
  icon: any;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  cta: string;
  ctaHref?: string;
  onAdd: () => void;
  added?: boolean;
  accent: "default" | "highlight";
  launchBadge?: boolean;
}) {
  const isHighlight = accent === "highlight";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {launchBadge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gold-gradient text-white border-0 shadow-md">
            <Sparkles className="size-3 mr-1" /> Launch offer
          </Badge>
        </div>
      )}
      <Card
        className={`h-full overflow-hidden transition-all ${
          isHighlight
            ? "border-2 border-primary shadow-xl scale-[1.02]"
            : "hover:shadow-card-hover hover:-translate-y-1"
        }`}
      >
        <div className={`h-1.5 ${isHighlight ? "bg-gold-gradient" : "bg-brand-gradient"}`} />
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`size-9 rounded-lg grid place-items-center ${
                isHighlight
                  ? "bg-gold/20 text-gold"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Icon className="size-5" />
            </div>
            <h3 className="font-bold text-base">{title}</h3>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{formatPkr(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPkr(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{period} payment</p>
          </div>

          <ul className="mt-5 space-y-2.5 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check
                  className={`size-4 shrink-0 mt-0.5 ${
                    isHighlight ? "text-gold" : "text-primary"
                  }`}
                  strokeWidth={2.5}
                />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {ctaHref ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={ctaHref}>
                  {cta}
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onAdd}
                disabled={added}
                className={`w-full ${
                  isHighlight
                    ? "bg-gold-gradient hover:opacity-90 text-white"
                    : "bg-brand-gradient hover:opacity-90"
                }`}
              >
                {added ? (
                  <>
                    <Check className="size-4 mr-1.5" /> Added
                  </>
                ) : (
                  cta
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
