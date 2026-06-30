"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown,
  Package,
  Check,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useCart, BUNDLE_IDS } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Pricing {
  perSubject: number;
  compulsoryBundle: number;
  optionalBundle: number;
  fullBundle: number;
  launchBundle: number;
  launchEnabled: boolean;
}

interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  savings: number;
  accent: "brand" | "gold";
  icon: "package" | "crown";
}

const COMPULSORY_SLUGS = [
  "current-affairs",
  "essay",
  "gsa",
  "islamic-studies",
  "pakistan-affairs",
  "precis-composition",
];
const OPTIONAL_SLUGS = [
  "gender-studies",
  "criminology",
  "usa-history",
  "ir-paper-1",
  "ir-paper-2",
  "public-administration",
];

export default function CartPage() {
  const { items, remove, total, clear } = useCart();

  // We don't strictly need pricing to render the cart — items already carry
  // their pricePkr. For the "you might also like" bundle suggestions we use
  // the per-subject price embedded in the first subject item, defaulting
  // to 1500, and the canonical bundle defaults from the project spec.
  const perSubjectPrice = useMemo(() => {
    const subjectItem = items.find((i) => i.type === "subject");
    return subjectItem?.pricePkr ?? 1500;
  }, [items]);

  // Compute bundle suggestions based on the current cart contents.
  const suggestions = useMemo<Suggestion[]>(() => {
    const p: Pricing = {
      perSubject: perSubjectPrice,
      compulsoryBundle: 6000,
      optionalBundle: 6000,
      fullBundle: 11000,
      launchBundle: 8999,
      launchEnabled: true,
    };

    const out: Suggestion[] = [];
    const subjectItems = items.filter((i) => i.type === "subject");
    const bundleIds = new Set(
      items.filter((i) => i.type === "bundle").map((i) => i.id)
    );
    const subjectSlugs = new Set(subjectItems.map((i) => i.id));
    const hasCompulsoryBundle = bundleIds.has(BUNDLE_IDS.compulsory);
    const hasOptionalBundle = bundleIds.has(BUNDLE_IDS.optional);
    const hasFullBundle = bundleIds.has(BUNDLE_IDS.full);

    // Suggest compulsory bundle if user has any compulsory subject but not the bundle.
    const compulsoryCount = COMPULSORY_SLUGS.filter((s) =>
      subjectSlugs.has(s)
    ).length;
    if (compulsoryCount > 0 && !hasCompulsoryBundle && !hasFullBundle) {
      out.push({
        id: BUNDLE_IDS.compulsory,
        title: "Compulsory Bundle",
        subtitle: `Get all 6 compulsory subjects — save ${formatPkr(
          p.perSubject * 6 - p.compulsoryBundle
        )} vs buying individually.`,
        price: p.compulsoryBundle,
        originalPrice: p.perSubject * 6,
        savings: p.perSubject * 6 - p.compulsoryBundle,
        accent: "brand",
        icon: "package",
      });
    }

    // Suggest optional bundle if user has any optional subject but not the bundle.
    const optionalCount = OPTIONAL_SLUGS.filter((s) =>
      subjectSlugs.has(s)
    ).length;
    if (optionalCount > 0 && !hasOptionalBundle && !hasFullBundle) {
      out.push({
        id: BUNDLE_IDS.optional,
        title: "Optional Bundle",
        subtitle: `Get all 6 optional subjects — save ${formatPkr(
          p.perSubject * 6 - p.optionalBundle
        )} vs buying individually.`,
        price: p.optionalBundle,
        originalPrice: p.perSubject * 6,
        savings: p.perSubject * 6 - p.optionalBundle,
        accent: "brand",
        icon: "package",
      });
    }

    // Suggest the Full Bundle if the user has fewer than 12 subjects and
    // doesn't already have the full bundle.
    const totalSubjectsCovered =
      compulsoryCount +
      optionalCount +
      (hasCompulsoryBundle ? 6 : 0) +
      (hasOptionalBundle ? 6 : 0);
    if (totalSubjectsCovered < 12 && !hasFullBundle) {
      const price = p.launchEnabled ? p.launchBundle : p.fullBundle;
      const originalPrice = p.launchEnabled ? p.fullBundle : p.perSubject * 12;
      out.push({
        id: BUNDLE_IDS.full,
        title: p.launchEnabled
          ? "Full Bundle — Launch Price"
          : "Full Bundle (12 subjects)",
        subtitle: p.launchEnabled
          ? "Limited launch offer — all 12 subjects at the lowest price ever."
          : "All 12 subjects — best value, lifetime access + free updates.",
        price,
        originalPrice,
        savings: originalPrice - price,
        accent: "gold",
        icon: "crown",
      });
    }

    return out;
  }, [items, perSubjectPrice]);

  const totalAmount = total();
  const itemCount = items.length;

  // Empty state
  if (itemCount === 0) {
    return (
      <div className="bg-background">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <div className="size-20 rounded-2xl bg-muted grid place-items-center shadow-sm">
              <ShoppingCart className="size-9 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              Browse our 12 CSS exam subjects and add notes to your cart. Bundles
              save you up to 50% versus buying individually.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-gradient hover:opacity-90"
              >
                <Link href="/subjects">
                  Browse Subjects
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#pricing">View pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ArrowRight className="size-3.5" />
          <span className="text-foreground font-medium">Cart</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your <span className="text-gradient-brand">Cart</span>
            </h1>
            <p className="mt-1.5 text-muted-foreground">
              Review your items and proceed to checkout when you&apos;re ready.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 font-medium w-fit"
          >
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Badge>
        </header>

        <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
              >
                <Card className="border-0 ring-1 ring-border hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`size-12 rounded-xl grid place-items-center shrink-0 ${
                          item.type === "bundle"
                            ? "bg-gold/20"
                            : "bg-brand-soft"
                        }`}
                      >
                        {item.type === "bundle" ? (
                          <Sparkles className="size-6 text-gold" />
                        ) : (
                          <Package className="size-6 text-primary" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base leading-tight">
                            {item.title}
                          </h3>
                          {item.type === "bundle" ? (
                            <Badge className="bg-gold/20 text-gold border-gold/30">
                              <Sparkles className="size-3 mr-1" />
                              Bundle
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-primary/30 text-primary bg-primary/5"
                            >
                              Subject
                            </Badge>
                          )}
                        </div>
                        {item.subjectSlugs && item.subjectSlugs.length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Includes {item.subjectSlugs.length} subjects
                          </p>
                        )}
                        <p className="mt-2 font-extrabold text-lg text-primary">
                          {formatPkr(item.pricePkr)}
                        </p>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Footer actions for the list */}
            <div className="flex items-center justify-between pt-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Link href="/subjects">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Continue browsing
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4 mr-1.5" />
                Clear cart
              </Button>
            </div>

            {/* You might also like */}
            {suggestions.length > 0 && (
              <section className="mt-10" aria-label="You might also like">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-gold" />
                  <h2 className="text-lg font-bold">You might also like</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestions.map((s) => (
                    <SuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Card className="border-0 ring-1 ring-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order summary</CardTitle>
                  <CardDescription>
                    Prices verified at checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">{formatPkr(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-gradient-brand">
                      {formatPkr(totalAmount)}
                    </span>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full mt-3 bg-brand-gradient hover:opacity-90 h-12"
                  >
                    <Link href="/checkout">
                      Proceed to checkout
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Lock className="size-3.5" />
                    Secure checkout · Manual verification
                  </div>

                  <Separator />

                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Verified seller — access granted after we verify your
                        payment (usually 5–10 minutes during the day).
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="size-4 text-gold shrink-0 mt-0.5" />
                      <span>
                        Lifetime access to all purchased notes, including free
                        updates.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion: s }: { suggestion: Suggestion }) {
  const { add, has } = useCart();
  const added = has(s.id);
  const Icon = s.icon === "crown" ? Crown : Package;

  return (
    <Card
      className={`overflow-hidden border-2 ${
        s.accent === "gold" ? "border-gold/40" : "border-primary/30"
      } shadow-sm`}
    >
      <div
        className={`h-1.5 ${s.accent === "gold" ? "bg-gold-gradient" : "bg-brand-gradient"}`}
      />
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`size-10 rounded-xl grid place-items-center shrink-0 ${
              s.accent === "gold" ? "bg-gold/20" : "bg-brand-soft"
            }`}
          >
            <Icon
              className={`size-5 ${
                s.accent === "gold" ? "text-gold" : "text-primary"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm leading-tight">{s.title}</h3>
              <Badge
                className={`border-0 ${
                  s.accent === "gold"
                    ? "bg-gold/20 text-gold border-gold/30"
                    : "bg-gold/20 text-gold border-gold/30"
                }`}
              >
                Save {formatPkr(s.savings)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {s.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-primary">
              {formatPkr(s.price)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPkr(s.originalPrice)}
            </span>
          </div>
          <Button
            size="sm"
            disabled={added}
            onClick={() =>
              add({
                type: "bundle",
                id: s.id,
                title: s.title,
                pricePkr: s.price,
              })
            }
            className={
              s.accent === "gold"
                ? "bg-gold-gradient hover:opacity-90 text-white"
                : "bg-brand-gradient hover:opacity-90"
            }
          >
            {added ? (
              <>
                <Check className="size-3.5 mr-1" /> Added
              </>
            ) : (
              <>
                Add to cart
                <ArrowRight className="size-3.5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
