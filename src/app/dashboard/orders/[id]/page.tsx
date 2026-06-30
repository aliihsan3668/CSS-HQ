import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Mail,
  ExternalLink,
  Receipt,
  CreditCard,
  CalendarDays,
  FileText,
  ShieldCheck,
  Info,
  AlertCircle,
  PartyPopper,
  BookOpen,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, PAYMENT_METHODS } from "@/lib/settings";
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

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
  APPROVED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
  REJECTED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900",
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Order #${id.slice(-6).toUpperCase()} — CSS HQ`,
    description: "Order details and payment verification status.",
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();
  // Owner or admin only
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  const settings = await getSettings();
  const supportWhatsapp = settings.SUPPORT_WHATSAPP || "923085202620";
  const supportEmail = settings.SUPPORT_EMAIL || "aliihsan.devs@gmail.com";

  const shortId = order.id.slice(-6).toUpperCase();
  const paymentMethodLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ||
    order.paymentMethod;

  const isPending = order.status === "PENDING";
  const isApproved = order.status === "APPROVED";
  const isRejected = order.status === "REJECTED";

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order #{shortId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mt-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-1.5" />
            Back to dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "size-14 rounded-2xl grid place-items-center shrink-0 text-white",
                isApproved
                  ? "bg-emerald-600"
                  : isPending
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
            >
              <Package className="size-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Order{" "}
                <span className="font-mono">#{shortId}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed {timeAgo(order.createdAt)} · {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-bold px-3 py-1.5 h-fit",
              STATUS_STYLES[order.status]
            )}
          >
            {order.status}
          </Badge>
        </div>

        {/* Callout based on status */}
        {isPending && (
          <Callout
            icon={Clock}
            tone="amber"
            title="Your payment is being verified."
            body="You'll get an email when it's approved — usually within 5–10 minutes during the day. If you submitted your order outside business hours, it may take a little longer."
          />
        )}
        {isApproved && (
          <Callout
            icon={PartyPopper}
            tone="emerald"
            title="Payment verified — your notes are unlocked!"
            body="Head over to your dashboard to start reading. All PDFs for the subjects in this order are now available to view and download."
            action={
              <Button asChild className="bg-brand-gradient hover:opacity-90">
                <Link href="/dashboard">
                  <BookOpen className="size-4 mr-1.5" />
                  Open my dashboard
                </Link>
              </Button>
            }
          />
        )}
        {isRejected && (
          <Callout
            icon={AlertCircle}
            tone="red"
            title="This order was rejected."
            body={
              order.rejectionReason
                ? `Reason: ${order.rejectionReason}`
                : "We couldn't verify this payment. Please reply to our email or WhatsApp us to resolve — we'll help you sort it out quickly."
            }
            action={
              <Button asChild variant="outline">
                <a
                  href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4 mr-1.5 text-emerald-600" />
                  WhatsApp us
                </a>
              </Button>
            }
          />
        )}

        <div className="mt-6 grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column — order info + items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items list */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Items in this order
                </CardTitle>
                <CardDescription className="text-xs">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y divide-border">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.bundleType
                              ? `${item.bundleType.charAt(0)}${item.bundleType.slice(1).toLowerCase()} bundle`
                              : "Single subject"}
                          </p>
                        </div>
                        <span className="text-sm font-semibold shrink-0">
                          {formatPkr(item.pricePkr)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-extrabold text-primary">
                    {formatPkr(order.totalAmountPkr)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order info */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="size-4 text-primary" />
                  Payment & order info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <InfoRow
                  icon={CalendarDays}
                  label="Order placed"
                  value={formatDate(order.createdAt)}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Payment method"
                  value={paymentMethodLabel}
                />
                <InfoRow
                  icon={Receipt}
                  label="Total amount"
                  value={formatPkr(order.totalAmountPkr)}
                  valueClassName="font-semibold"
                />
                {order.paymentNotes && (
                  <InfoRow
                    icon={FileText}
                    label="Your notes (Txn ID / details)"
                    value={order.paymentNotes}
                    multiline
                  />
                )}
                {isRejected && order.rejectionReason && (
                  <InfoRow
                    icon={AlertCircle}
                    label="Rejection reason"
                    value={order.rejectionReason}
                    multiline
                    valueClassName="text-red-700 dark:text-red-300"
                  />
                )}
                {order.approvedAt && (
                  <InfoRow
                    icon={CheckCircle2}
                    label="Approved at"
                    value={formatDate(order.approvedAt)}
                    valueClassName="text-emerald-700 dark:text-emerald-300"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column — status timeline + support */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Status timeline */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Status timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="relative">
                  {/* Step 1 — Order placed */}
                  <TimelineStep
                    icon={CheckCircle2}
                    title="Order placed"
                    subtitle={formatDate(order.createdAt)}
                    state="done"
                    isLast={false}
                  />
                  {/* Step 2 — Verification */}
                  <TimelineStep
                    icon={isRejected ? XCircle : isApproved ? CheckCircle2 : Clock}
                    title={
                      isRejected
                        ? "Payment rejected"
                        : isApproved
                          ? "Payment verified"
                          : "Awaiting verification"
                    }
                    subtitle={
                      isApproved && order.approvedAt
                        ? formatDate(order.approvedAt)
                        : isRejected && order.updatedAt
                          ? formatDate(order.updatedAt)
                          : isPending
                            ? "Usually within 5–10 min during the day"
                            : "—"
                    }
                    state={
                      isApproved
                        ? "done"
                        : isRejected
                          ? "failed"
                          : "active"
                    }
                    isLast={!isApproved}
                  />
                  {/* Step 3 — Notes unlocked (only if approved) */}
                  {isApproved && (
                    <TimelineStep
                      icon={BookOpen}
                      title="Notes unlocked"
                      subtitle="All PDFs available — open dashboard to read."
                      state="done"
                      isLast={true}
                    />
                  )}
                </ol>
              </CardContent>
            </Card>

            {/* Support card */}
            <Card className="border-0 ring-1 ring-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="size-4 text-emerald-600" />
                  Questions about this order?
                </CardTitle>
                <CardDescription className="text-xs">
                  Mention your order ID <span className="font-mono">#{shortId}</span>{" "}
                  when you reach out.
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

            {/* Trust note */}
            <div className="rounded-xl bg-muted/40 p-4 flex items-start gap-3">
              <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">
                  Manual verification keeps things safe.
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  We verify each payment by hand to prevent fraud — thank you
                  for your patience.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Need a copy of your receipt or invoice? Reach out via WhatsApp and
            we&apos;ll send it over.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1.5" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Callout({
  icon: Icon,
  tone,
  title,
  body,
  action,
}: {
  icon: React.ElementType;
  tone: "amber" | "emerald" | "red";
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const toneClasses = {
    amber:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
    emerald:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
    red: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
  }[tone];
  const iconClasses = {
    amber: "text-amber-700 dark:text-amber-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    red: "text-red-700 dark:text-red-300",
  }[tone];
  return (
    <div className={cn("mt-6 rounded-xl border p-4 sm:p-5", toneClasses)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("size-5 shrink-0 mt-0.5", iconClasses)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-sm mt-0.5 text-foreground/80">{body}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName,
  multiline,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClassName?: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-muted grid place-items-center shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <p
          className={cn(
            "text-sm",
            multiline ? "whitespace-pre-wrap break-words" : "truncate",
            valueClassName
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  title,
  subtitle,
  state,
  isLast,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  state: "done" | "active" | "failed";
  isLast: boolean;
}) {
  const dotBg = {
    done: "bg-emerald-500 text-white",
    active: "bg-amber-500 text-white",
    failed: "bg-red-500 text-white",
  }[state];
  const titleClass = {
    done: "text-foreground",
    active: "text-amber-700 dark:text-amber-300 font-semibold",
    failed: "text-red-700 dark:text-red-300 font-semibold",
  }[state];
  return (
    <li className="relative pl-10 pb-6 last:pb-0">
      {/* connector line */}
      {!isLast && (
        <span
          className="absolute left-[15px] top-7 bottom-0 w-px bg-border"
          aria-hidden
        />
      )}
      {/* dot */}
      <span
        className={cn(
          "absolute left-0 top-0.5 size-8 rounded-full grid place-items-center ring-4 ring-card",
          dotBg
        )}
      >
        <Icon className="size-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm leading-tight", titleClass)}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </li>
  );
}
