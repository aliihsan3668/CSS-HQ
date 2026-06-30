"use client";

import { useCart } from "@/lib/cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatPkr } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, setOpen, remove, total, clear } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            Your Cart
            {items.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Items you have added to your cart.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center p-6 text-center">
            <div className="space-y-4">
              <div className="size-16 rounded-full bg-muted grid place-items-center mx-auto">
                <ShoppingCart className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse subjects and add notes to get started.
                </p>
              </div>
              <Button asChild className="bg-brand-gradient hover:opacity-90">
                <Link
                  href="/subjects"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2"
                >
                  Browse Subjects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 scrollbar-premium">
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.type === "bundle" && (
                          <Badge className="bg-gold/20 text-gold border-gold/30">
                            <Sparkles className="size-3 mr-1" />
                            Bundle
                          </Badge>
                        )}
                        <span className="text-sm font-semibold text-primary">
                          {formatPkr(item.pricePkr)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 -mr-1 -mt-1 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold">{formatPkr(total())}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gradient hover:opacity-90 w-full"
                >
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    Checkout
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-muted-foreground"
                  >
                    Clear cart
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/subjects" onClick={() => setOpen(false)}>
                      Continue browsing
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
