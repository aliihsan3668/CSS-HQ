"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatPkr } from "@/lib/format";

interface BundleBannerProps {
  id: "bundle-compulsory" | "bundle-optional";
  title: string;
  subtitle: string;
  price: number;
  perSubjectPrice: number;
  count: number;
  accent?: "brand" | "gold";
}

export function BundleBanner({
  id,
  title,
  subtitle,
  price,
  perSubjectPrice,
  count,
  accent = "brand",
}: BundleBannerProps) {
  const { add, has } = useCart();
  const added = has(id);
  const savings = perSubjectPrice * count - price;
  const isGold = accent === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <Card
        className={`overflow-hidden border-2 shadow-lg ${
          isGold ? "border-gold/40" : "border-primary/30"
        }`}
      >
        <div className={isGold ? "bg-gold-gradient p-1" : "bg-brand-gradient p-1"} />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className={`size-14 rounded-2xl grid place-items-center shrink-0 ${
                isGold ? "bg-gold/20" : "bg-gold/20"
              }`}
            >
              <Sparkles className={`size-7 ${isGold ? "text-gold" : "text-gold"}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">{title}</h3>
                <Badge
                  className={`border-0 ${
                    isGold
                      ? "bg-gold/20 text-gold border-gold/30"
                      : "bg-gold/20 text-gold border-gold/30"
                  }`}
                >
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
                onClick={() =>
                  add({
                    type: "bundle",
                    id,
                    title: `${title} (${count} subjects)`,
                    pricePkr: price,
                  })
                }
                disabled={added}
                className="bg-brand-gradient hover:opacity-90 w-full sm:w-auto"
              >
                {added ? (
                  <>
                    <Check className="size-4 mr-1.5" /> Added to cart
                  </>
                ) : (
                  <>
                    Add bundle to cart
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
