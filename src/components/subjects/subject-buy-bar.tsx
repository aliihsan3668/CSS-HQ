"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { SubjectPublic } from "@/lib/subjects";

interface SubjectBuyBarProps {
  subject: SubjectPublic;
  variant?: "hero" | "card";
}

export function SubjectBuyBar({ subject, variant = "hero" }: SubjectBuyBarProps) {
  const router = useRouter();
  const { add, has } = useCart();
  const inCart = has(subject.slug);

  const handleAdd = () =>
    add({
      type: "subject",
      id: subject.slug,
      title: subject.name,
      pricePkr: subject.pricePkr,
    });

  const handleBuyNow = () => {
    add({
      type: "subject",
      id: subject.slug,
      title: subject.name,
      pricePkr: subject.pricePkr,
    });
    router.push("/checkout");
  };

  if (variant === "card") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleAdd}
          disabled={inCart}
          variant={inCart ? "secondary" : "outline"}
          className="w-full"
        >
          {inCart ? (
            <>
              <Check className="size-4 mr-1.5" /> Added to cart
            </>
          ) : (
            <>
              <ShoppingCart className="size-4 mr-1.5" /> Add to cart
            </>
          )}
        </Button>
        <Button
          onClick={handleBuyNow}
          className="w-full bg-brand-gradient hover:opacity-90"
        >
          <Zap className="size-4 mr-1.5" /> Buy now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button
        size="lg"
        onClick={handleAdd}
        disabled={inCart}
        variant={inCart ? "secondary" : "outline"}
      >
        {inCart ? (
          <>
            <Check className="size-4 mr-1.5" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="size-4 mr-1.5" /> Add to cart
          </>
        )}
      </Button>
      <Button
        size="lg"
        onClick={handleBuyNow}
        className="bg-brand-gradient hover:opacity-90"
      >
        <Zap className="size-4 mr-1.5" /> Buy now
      </Button>
    </div>
  );
}
