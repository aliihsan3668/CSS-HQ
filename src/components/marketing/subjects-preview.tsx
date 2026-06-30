"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubjectCard } from "@/components/subjects/subject-card";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";
import type { SubjectPublic } from "@/lib/subjects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  subjects: SubjectPublic[];
  pricing: {
    perSubject: number;
    compulsoryBundle: number;
    optionalBundle: number;
    fullBundle: number;
    launchBundle: number;
    launchEnabled: boolean;
  };
}

export function SubjectsPreview({ subjects, pricing }: Props) {
  const compulsory = subjects.filter((s) => s.category === "COMPULSORY");
  const optional = subjects.filter((s) => s.category === "OPTIONAL");
  const { add, has } = useCart();

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            12 subjects. Full coverage.
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pick a subject, or{" "}
            <span className="text-gradient-brand">grab the bundle.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Buy individually at 1,500 PKR per subject, or save big with a bundle.
            Every subject comes with past papers, MCQs, model answers, and
            color-coded most-likely questions.
          </p>
        </div>

        <Tabs defaultValue="compulsory" className="mt-10">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-auto">
            <TabsTrigger value="compulsory" className="py-2.5">
              Compulsory ({compulsory.length})
            </TabsTrigger>
            <TabsTrigger value="optional" className="py-2.5">
              Optional ({optional.length})
            </TabsTrigger>
          </TabsList>

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
              onAdd={() =>
                add({
                  type: "bundle",
                  id: "bundle-compulsory",
                  title: "Compulsory Bundle (6 subjects)",
                  pricePkr: pricing.compulsoryBundle,
                })
              }
              added={has("bundle-compulsory")}
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
              onAdd={() =>
                add({
                  type: "bundle",
                  id: "bundle-optional",
                  title: "Optional Bundle (6 subjects)",
                  pricePkr: pricing.optionalBundle,
                })
              }
              added={has("bundle-optional")}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/subjects">
              View all subjects
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function BundleBanner({
  title,
  subtitle,
  price,
  perSubjectPrice,
  count,
  onAdd,
  added,
}: {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  perSubjectPrice: number;
  count: number;
  onAdd: () => void;
  added: boolean;
}) {
  const savings = perSubjectPrice * count - price;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <Card className="overflow-hidden border-2 border-primary/30 shadow-lg">
        <div className="bg-brand-gradient p-1" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="size-14 rounded-2xl bg-gold/20 grid place-items-center shrink-0">
              <Sparkles className="size-7 text-gold" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">{title}</h3>
                <Badge className="bg-gold/20 text-gold border-gold/30">
                  Save {formatPkr(savings)}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <p className="text-2xl font-extrabold text-primary">
                {formatPkr(price)}
              </p>
              <Button
                onClick={onAdd}
                disabled={added}
                className="bg-brand-gradient hover:opacity-90 w-full sm:w-auto"
              >
                {added ? (
                  <>
                    <Check className="size-4 mr-1.5" /> Added to cart
                  </>
                ) : (
                  "Add bundle to cart"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
