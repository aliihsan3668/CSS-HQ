"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CreditCard,
  Upload,
  X,
  Check,
  Loader2,
  ShieldCheck,
  MessageCircle,
  Mail,
  Copy,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Package,
  Info,
  FileText,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type PaymentMethodId =
  | "JAZZCASH"
  | "EASYPaisa"
  | "NAYAPAY"
  | "SADAPAY"
  | "PAYONEER";

interface PaymentMethodInfo {
  id: PaymentMethodId;
  label: string;
  account: string;
  title: string;
  instructions: string;
}

interface PaymentMethodsResponse {
  methods: PaymentMethodInfo[];
  instructions: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const SUPPORT_WHATSAPP = "+923085202620";
const SUPPORT_EMAIL = "aliihsan.devs@gmail.com";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, clear } = useCart();

  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [globalInstructions, setGlobalInstructions] = useState("");
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | "">("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptKind, setReceiptKind] = useState<"image" | "pdf" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalAmount = total();
  const itemCount = items.length;

  // Fetch payment methods on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payment-methods", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load payment methods");
        const data: PaymentMethodsResponse = await res.json();
        if (cancelled) return;
        setMethods(data.methods);
        setGlobalInstructions(data.instructions);
      } catch (e) {
        if (!cancelled) {
          toast.error("Could not load payment methods. Please refresh.");
        }
      } finally {
        if (!cancelled) setLoadingMethods(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auth gate
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login?callbackUrl=/checkout");
    }
  }, [status, session, router]);

  const selectedMethodObj = useMemo(
    () => methods.find((m) => m.id === selectedMethod) ?? null,
    [methods, selectedMethod]
  );

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_BYTES) {
        toast.error("File is too large. Maximum size is 5 MB.");
        return;
      }
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) {
        toast.error("Please upload an image (PNG/JPG/WebP) or a PDF.");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setReceiptFile(file);
        setReceiptDataUrl(dataUrl);
        setReceiptKind(isPdf ? "pdf" : "image");
        if (isImage) {
          setReceiptPreview(dataUrl);
        } else {
          setReceiptPreview(null);
        }
      } catch {
        toast.error("Could not read file. Please try again.");
      }
    },
    []
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptDataUrl(null);
    setReceiptPreview(null);
    setReceiptKind(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  const onSubmit = async () => {
    if (!session?.user) {
      toast.error("Please sign in to place your order.");
      router.replace("/login?callbackUrl=/checkout");
      return;
    }
    if (!selectedMethod) {
      toast.error("Please select a payment method.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!receiptDataUrl || !receiptFile) {
      toast.error("Please upload your payment receipt.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod: selectedMethod,
          paymentNotes: paymentNotes.trim() || undefined,
          receiptDataUrl,
          receiptFilename: receiptFile.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Checkout failed. Please try again.");
      }
      clear();
      toast.success("Order submitted! Awaiting verification.");
      router.push(`/dashboard/orders/${data.orderId}`);
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Loading / auth states ----
  if (status === "loading") {
    return (
      <div className="bg-background min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Loading checkout…</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    // The effect will redirect; render nothing meaningful meanwhile.
    return (
      <div className="bg-background min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  // ---- Empty cart ----
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
              <Package className="size-9 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              Add some subjects or a bundle to your cart before checking out.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 bg-brand-gradient hover:opacity-90"
            >
              <Link href="/subjects">
                Browse Subjects
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-28 lg:pb-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
        >
          <Link href="/cart" className="hover:text-foreground transition-colors">
            Cart
          </Link>
          <ArrowRight className="size-3.5" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Secure <span className="text-gradient-brand">Checkout</span>
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Pay manually, upload your receipt, and we&apos;ll verify within 5–10
            minutes during the day.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECTION A — Order summary */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="size-6 rounded-full bg-brand-soft text-primary grid place-items-center text-xs font-bold">
                    1
                  </span>
                  Order summary
                </CardTitle>
                <CardDescription>
                  Prices are re-verified on our server before your order is
                  created.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl border bg-card"
                  >
                    <div
                      className={`size-10 rounded-lg grid place-items-center shrink-0 ${
                        item.type === "bundle" ? "bg-gold/20" : "bg-brand-soft"
                      }`}
                    >
                      {item.type === "bundle" ? (
                        <Sparkles className="size-5 text-gold" />
                      ) : (
                        <Package className="size-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm leading-snug">
                          {item.title}
                        </p>
                        {item.type === "bundle" ? (
                          <Badge className="bg-gold/20 text-gold border-gold/30">
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
                    </div>
                    <p className="font-semibold text-sm whitespace-nowrap">
                      {formatPkr(item.pricePkr)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-2xl font-extrabold text-gradient-brand">
                    {formatPkr(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* SECTION B — Payment method */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="size-6 rounded-full bg-brand-soft text-primary grid place-items-center text-xs font-bold">
                    2
                  </span>
                  Choose a payment method
                </CardTitle>
                <CardDescription>
                  Pay the exact total ({formatPkr(totalAmount)}) to one of the
                  accounts below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMethods ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedMethod}
                    onValueChange={(v) => setSelectedMethod(v as PaymentMethodId)}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    {methods.map((m) => {
                      const selected = selectedMethod === m.id;
                      return (
                        <Label
                          key={m.id}
                          htmlFor={`pm-${m.id}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => e.preventDefault()}
                          className={cn(
                            "relative cursor-pointer rounded-xl border-2 p-4 transition-all block",
                            selected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              id={`pm-${m.id}`}
                              value={m.id}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CreditCard
                                  className={cn(
                                    "size-4",
                                    selected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <span className="font-semibold text-sm">
                                  {m.label}
                                </span>
                                {selected && (
                                  <Check className="size-4 text-primary ml-auto" />
                                )}
                              </div>
                              {m.account ? (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md truncate max-w-[12rem]">
                                    {m.account}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      copyToClipboard(m.account, m.label);
                                    }}
                                    className="size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                                    aria-label={`Copy ${m.label} account`}
                                  >
                                    <Copy className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Account not configured
                                </p>
                              )}
                              {m.title && (
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  Account title:{" "}
                                  <span className="font-medium text-foreground/80">
                                    {m.title}
                                  </span>
                                </p>
                              )}
                              <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                                {m.instructions}
                              </p>
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}

                {selectedMethodObj && (
                  <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Pay {formatPkr(totalAmount)}
                    </span>{" "}
                    to the {selectedMethodObj.label} account above, then upload
                    your receipt in step 4.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION C — Payment instructions */}
            <Card className="border-0 ring-1 ring-border">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-sky-100 dark:bg-sky-950/40 grid place-items-center shrink-0">
                    <Info className="size-5 text-sky-700 dark:text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base">How to pay & verify</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {globalInstructions}
                    </p>
                    <ol className="mt-3 space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-bold shrink-0">
                          1
                        </span>
                        <span>
                          Pay the exact amount (
                          <span className="font-semibold">
                            {formatPkr(totalAmount)}
                          </span>
                          ) to the selected method&apos;s account.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-bold shrink-0">
                          2
                        </span>
                        <span>Take a screenshot of the payment confirmation.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-bold shrink-0">
                          3
                        </span>
                        <span>Upload the screenshot below.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="size-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-bold shrink-0">
                          4
                        </span>
                        <span>
                          Submit — we verify within ~5–10 minutes during the day.
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION D — Receipt upload */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="size-6 rounded-full bg-brand-soft text-primary grid place-items-center text-xs font-bold">
                    3
                  </span>
                  Upload payment receipt
                </CardTitle>
                <CardDescription>
                  PNG, JPG, WebP or PDF · max 5 MB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {receiptFile ? (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-4">
                      {receiptKind === "image" && receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="size-20 object-cover rounded-lg border bg-white"
                        />
                      ) : (
                        <div className="size-20 rounded-lg border bg-muted grid place-items-center">
                          <FileText className="size-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileImage className="size-4 text-primary" />
                          <p className="font-medium text-sm truncate">
                            {receiptFile.name}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(receiptFile.size / 1024).toFixed(0)} KB ·{" "}
                          {receiptKind === "pdf" ? "PDF" : "Image"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            Ready to submit
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={removeReceipt}
                        aria-label="Remove receipt"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Label
                    htmlFor="receipt-input"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                      "block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      id="receipt-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 rounded-xl bg-muted grid place-items-center">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">
                        Drop your receipt here, or{" "}
                        <span className="text-primary underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WebP or PDF · max 5 MB
                      </p>
                    </div>
                  </Label>
                )}

                <div className="space-y-2">
                  <Label htmlFor="payment-notes">
                    Transaction ID / notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="payment-notes"
                    placeholder="e.g. JazzCash TID 8492034, paid 3:45 PM from Ali Ihsan"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value.slice(0, 500))}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {paymentNotes.length}/500
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SECTION E — Submit (desktop inline) */}
            <div className="hidden lg:block">
              <Button
                size="lg"
                className="w-full h-12 bg-brand-gradient hover:opacity-90"
                disabled={!selectedMethod || !receiptDataUrl || submitting}
                onClick={onSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Lock className="size-4 mr-2" />
                    Submit order for verification
                  </>
                )}
              </Button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                Your receipt is private and only seen by our admin for
                verification.
              </div>
              <div className="mt-2 flex items-center justify-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/cart">
                    <ArrowLeft className="size-4 mr-1.5" />
                    Back to cart
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar — sticky summary */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              <Card className="border-0 ring-1 ring-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">
                      {selectedMethodObj?.label ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Receipt</span>
                    <span
                      className={cn(
                        "font-medium",
                        receiptFile
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      )
                    }>
                      {receiptFile ? "Uploaded" : "Not uploaded"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-2xl font-extrabold text-gradient-brand">
                      {formatPkr(totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-0 ring-1 ring-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Need help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <MessageCircle className="size-4 text-emerald-600" />
                    <span>WhatsApp: {SUPPORT_WHATSAPP}</span>
                  </a>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <Mail className="size-4 text-primary" />
                    <span className="truncate">{SUPPORT_EMAIL}</span>
                  </a>
                </CardContent>
              </Card>

              {/* Trust badges */}
              <Card className="border-0 ring-1 ring-border">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-sm">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Verified seller</p>
                      <p className="text-xs text-muted-foreground">
                        Manual verification by the seller.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Private receipt</p>
                      <p className="text-xs text-muted-foreground">
                        Only seen by our admin for verification.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Lifetime access</p>
                      <p className="text-xs text-muted-foreground">
                        Free updates included on all purchases.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Total
            </p>
            <p className="text-lg font-extrabold text-gradient-brand leading-tight">
              {formatPkr(totalAmount)}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-brand-gradient hover:opacity-90 h-12 px-6"
            disabled={!selectedMethod || !receiptDataUrl || submitting}
            onClick={onSubmit}
          >
            {submitting ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Lock className="size-4 mr-2" />
            )}
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
