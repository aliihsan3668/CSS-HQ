import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import {
  BookOpen,
  Package,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatPkr, formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
  APPROVED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
  REJECTED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900",
};

const ACCENT_MAP: Record<string, { bg: string; text: string }> = {
  emerald: {
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary",
  },
  amber: {
    bg: "bg-gold/15 dark:bg-gold/20",
    text: "text-gold",
  },
};

export const metadata = {
  title: "My Dashboard — CSS HQ",
  description: "View your purchased notes and orders.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [purchases, orders, settings] = await Promise.all([
    db.purchase.findMany({
      where: { userId: user.id },
      include: {
        subject: {
          include: { pdfs: { select: { id: true, title: true, fileSize: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    getSettings(),
  ]);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const recentOrders = orders.slice(0, 5);
  const supportWhatsapp = settings.SUPPORT_WHATSAPP || "923085202620";
  const supportEmail = settings.SUPPORT_EMAIL || "aliihsan.devs@gmail.com";
  const firstName = user.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Subjects unlocked",
      value: purchases.length,
      icon: BookOpen,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Total orders",
      value: orders.length,
      icon: Package,
      accent: "bg-gold/15 text-gold",
    },
    {
      label: "Pending orders",
      value: pendingCount,
      icon: Clock,
      accent: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-brand-gradient grid place-items-center shadow-brand shrink-0">
              <BookOpen className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                My Dashboard
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Welcome back,{" "}
                <span className="font-semibold text-foreground">{firstName}</span>{" "}
                · here&apos;s everything you&apos;ve unlocked.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/subjects">
                <ShoppingBag className="size-4 mr-1.5" />
                Browse subjects
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="border-0 ring-1 ring-border">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={cn(
                      "size-12 rounded-xl grid place-items-center shrink-0",
                      stat.accent
                    )}
                  >
                    <SIcon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-3xl font-extrabold leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column — purchased notes */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Sparkles className="size-5 text-gold" />
                    Your purchased notes
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {purchases.length > 0
                      ? `${purchases.length} subject${purchases.length > 1 ? "s" : ""} unlocked — click to open notes.`
                      : "Unlock your first subject to access premium notes."}
                  </p>
                </div>
              </div>

              {purchases.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 px-6 text-center">
                    <div className="size-16 rounded-2xl bg-muted grid place-items-center mx-auto mb-4">
                      <BookOpen className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-base">
                      You haven&apos;t unlocked any notes yet
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
                      Browse 12 CSS subjects with color-coded most-likely
                      questions, full model answers, and past paper analysis.
                    </p>
                    <Button asChild className="mt-5 bg-brand-gradient hover:opacity-90">
                      <Link href="/subjects">
                        Browse subjects
                        <ArrowRight className="size-4 ml-1.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {purchases.map((p) => {
                    const subject = p.subject;
                    const Icon =
                      (Icons as any)[subject.iconKey] || Icons.BookOpen;
                    const accent =
                      ACCENT_MAP[subject.accentColor] || ACCENT_MAP.emerald;
                    const pdfCount = subject.pdfs.length;
                    const isCompulsory = subject.category === "COMPULSORY";
                    return (
                      <Card
                        key={p.id}
                        className="group relative overflow-hidden border-0 ring-1 ring-border transition-all hover:shadow-card-hover hover:-translate-y-0.5"
                      >
                        <div className="h-1.5 bg-brand-gradient" />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={cn(
                                "size-12 rounded-xl grid place-items-center shrink-0",
                                accent.bg
                              )}
                            >
                              <Icon
                                className={cn("size-6", accent.text)}
                                strokeWidth={2}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="size-4 text-emerald-500" />
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  isCompulsory
                                    ? "border-primary/30 text-primary bg-primary/5"
                                    : "border-gold/40 text-gold bg-gold/10"
                                )}
                              >
                                {isCompulsory ? "Compulsory" : "Optional"}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="mt-3 font-bold text-base leading-tight line-clamp-2">
                            {subject.name}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {subject.shortDesc}
                          </p>

                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="size-3.5" />
                            <span>
                              {pdfCount > 0
                                ? `${pdfCount} PDF${pdfCount > 1 ? "s" : ""} available`
                                : "PDFs coming soon"}
                            </span>
                            <span className="text-border">·</span>
                            <span>Unlocked {timeAgo(p.createdAt)}</span>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className="mt-4 w-full bg-brand-gradient hover:opacity-90"
                          >
                            <Link href={`/dashboard/subject/${subject.slug}`}>
                              <BookOpen className="size-4 mr-1.5" />
                              Open notes
                              <ArrowRight className="size-4 ml-1.5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right column — recent orders + support */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    Recent orders
                  </CardTitle>
                  {orders.length > 0 && (
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                      <Link href="#all-orders">
                        View all
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Your latest order activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="size-10 rounded-lg bg-muted grid place-items-center mx-auto mb-2">
                      <Package className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No orders yet.
                    </p>
                    <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0">
                      <Link href="/subjects">Browse subjects</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto scrollbar-premium pr-1">
                    {recentOrders.map((order) => {
                      const shortId = order.id.slice(-6).toUpperCase();
                      const itemTitles = order.items
                        .map((i) => i.title)
                        .slice(0, 2)
                        .join(", ");
                      const extraCount = order.items.length - 2;
                      return (
                        <li key={order.id}>
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="block rounded-lg border border-border bg-card p-3 hover:bg-muted/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold">
                                #{shortId}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0",
                                  STATUS_STYLES[order.status]
                                )}
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {itemTitles}
                              {extraCount > 0
                                ? ` +${extraCount} more`
                                : ""}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-primary">
                                {formatPkr(order.totalAmountPkr)}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {timeAgo(order.createdAt)}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Support card */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="size-4 text-emerald-600" />
                  Need help?
                </CardTitle>
                <CardDescription className="text-xs">
                  Reach out — we usually reply within minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="size-9 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 grid place-items-center shrink-0">
                    <MessageCircle className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="text-sm font-medium truncate">
                      +{supportWhatsapp}
                    </p>
                  </div>
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">
                      {supportEmail}
                    </p>
                  </div>
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* All orders section */}
        <section id="all-orders" className="mt-10 scroll-mt-24">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Package className="size-5 text-primary" />
                All orders
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {orders.length > 0
                  ? `${orders.length} order${orders.length > 1 ? "s" : ""} total.`
                  : "Your order history will appear here."}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-10 px-6 text-center">
                <div className="size-12 rounded-xl bg-muted grid place-items-center mx-auto mb-3">
                  <Package className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t placed any orders yet.
                </p>
                <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0">
                  <Link href="/subjects">Browse subjects to get started</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 ring-1 ring-border overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left font-semibold px-4 py-3">Order</th>
                      <th className="text-left font-semibold px-4 py-3">Date</th>
                      <th className="text-left font-semibold px-4 py-3">Items</th>
                      <th className="text-right font-semibold px-4 py-3">Total</th>
                      <th className="text-left font-semibold px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const shortId = order.id.slice(-6).toUpperCase();
                      const itemTitles = order.items
                        .map((i) => i.title)
                        .slice(0, 2)
                        .join(", ");
                      const extraCount = order.items.length - 2;
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-bold">
                            #{shortId}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            <div>{formatDate(order.createdAt).split(",")[0]}</div>
                            <div className="text-[10px]">
                              {timeAgo(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="line-clamp-1">
                              {itemTitles}
                              {extraCount > 0 ? ` +${extraCount}` : ""}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatPkr(order.totalAmountPkr)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold",
                                STATUS_STYLES[order.status]
                              )}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                              <Link href={`/dashboard/orders/${order.id}`}>
                                View
                                <ArrowRight className="size-3 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <ul className="md:hidden divide-y divide-border">
                {orders.map((order) => {
                  const shortId = order.id.slice(-6).toUpperCase();
                  const itemTitles = order.items
                    .map((i) => i.title)
                    .slice(0, 2)
                    .join(", ");
                  const extraCount = order.items.length - 2;
                  return (
                    <li key={order.id}>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="block p-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold">
                            #{shortId}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              STATUS_STYLES[order.status]
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium line-clamp-2">
                          {itemTitles}
                          {extraCount > 0 ? ` +${extraCount} more` : ""}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">
                            {formatPkr(order.totalAmountPkr)}
                          </span>
                          <span className="text-xs text-muted-foreground inline-flex items-center">
                            {timeAgo(order.createdAt)}
                            <ArrowRight className="size-3 ml-1" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </section>

        {/* Footer note */}
        <div className="mt-10 rounded-xl bg-muted/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <ShieldCheck className="size-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Your purchased notes are private to your account.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sharing, reselling, or redistributing is not permitted and may
              result in access being revoked.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/subjects">
              <ArrowLeft className="size-4 mr-1.5" />
              Keep browsing
            </Link>
          </Button>
        </div>

        <Separator className="my-8" />
      </div>
    </div>
  );
}
