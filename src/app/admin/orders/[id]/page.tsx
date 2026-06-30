import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Receipt,
  CreditCard,
  Calendar,
  AlertTriangle,
  FileText,
  ExternalLink,
  Package,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPkr, formatDate } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "@/components/admin/order-actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  APPROVED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  REJECTED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
};

function shortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

function paymentMethodLabel(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase();
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="size-8 rounded-md bg-muted grid place-items-center shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium break-words">{children}</div>
      </div>
    </div>
  );
}

function BundleBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    COMPULSORY: "bg-primary/10 text-primary border-primary/20",
    OPTIONAL: "bg-gold/15 text-gold border-gold/30",
    FULL: "bg-brand-gradient/15 text-primary border-primary/30",
  };
  return (
    <Badge
      variant="outline"
      className={"text-[10px] uppercase tracking-wide " + (map[type] || "")}
    >
      {type.toLowerCase()} bundle
    </Badge>
  );
}

export default async function AdminOrderReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      items: {
        include: { subject: { select: { slug: true, name: true } } },
      },
    },
  });
  if (!order) notFound();

  const receiptUrl = order.paymentScreenshot
    ? `/api/blob-proxy?key=${encodeURIComponent(order.paymentScreenshot)}`
    : null;

  // Heuristic: receipts are PDFs if the storage key ends with .pdf
  const isPdfReceipt =
    !!order.paymentScreenshot &&
    order.paymentScreenshot.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      {/* Breadcrumb / back link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
              Order <span className="font-mono">#{shortId(order.id)}</span>
              <Badge
                variant="outline"
                className={
                  "text-xs " + STATUS_STYLES[order.status]
                }
              >
                {order.status}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/orders/${order.id}`}>
                <ExternalLink className="size-3.5" />
                Student view
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <InfoRow icon={User} label="Name">
                {order.user.name || (
                  <span className="text-muted-foreground italic">No name provided</span>
                )}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                <a
                  href={`mailto:${order.user.email}`}
                  className="text-primary hover:underline"
                >
                  {order.user.email}
                </a>
              </InfoRow>
              {order.user.phone && (
                <InfoRow icon={Phone} label="Phone">
                  {order.user.phone}
                </InfoRow>
              )}
              <InfoRow icon={Package} label="User ID">
                <span className="font-mono text-xs">{order.user.id}</span>
              </InfoRow>
            </CardContent>
          </Card>

          {/* Order items */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                Order items
                <span className="text-xs text-muted-foreground font-normal">
                  ({order.items.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-2"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium">{item.title}</span>
                    <div className="flex items-center gap-2">
                      {item.bundleType ? (
                        <BundleBadge type={item.bundleType} />
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wide"
                        >
                          subject
                        </Badge>
                      )}
                      {item.subject && (
                        <Link
                          href={`/subjects/${item.subject.slug}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          /subjects/{item.subject.slug}
                        </Link>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatPkr(item.pricePkr)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm">{formatPkr(order.totalAmountPkr)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-extrabold text-gradient-brand">
                  {formatPkr(order.totalAmountPkr)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Payment info
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <InfoRow icon={CreditCard} label="Method">
                {paymentMethodLabel(order.paymentMethod)}
              </InfoRow>
              <InfoRow icon={Calendar} label="Submitted">
                {formatDate(order.createdAt)}
              </InfoRow>
              {order.paymentNotes && (
                <InfoRow icon={Receipt} label="Buyer notes / transaction ID">
                  <span className="whitespace-pre-wrap text-sm">
                    {order.paymentNotes}
                  </span>
                </InfoRow>
              )}
              {!order.paymentNotes && (
                <div className="flex items-center gap-3 py-2">
                  <div className="size-8 rounded-md bg-muted grid place-items-center shrink-0">
                    <Receipt className="size-4 text-muted-foreground/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Buyer notes</p>
                    <p className="text-sm text-muted-foreground italic">
                      No notes provided
                    </p>
                  </div>
                </div>
              )}
              {order.approvedAt && (
                <InfoRow icon={Calendar} label="Approved at">
                  {formatDate(order.approvedAt)}
                </InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Rejection reason */}
          {order.status === "REJECTED" && order.rejectionReason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="border-b bg-red-50/50 dark:bg-red-950/20">
                <CardTitle className="text-base flex items-center gap-2 text-red-800 dark:text-red-300">
                  <AlertTriangle className="size-4" />
                  Rejection reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">
                  {order.rejectionReason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column (sticky) */}
        <div className="lg:sticky lg:top-32 space-y-6">
          {/* Receipt viewer */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                Payment receipt
              </CardTitle>
              <CardDescription>
                Verify this matches the order total of{" "}
                <span className="font-semibold text-foreground">
                  {formatPkr(order.totalAmountPkr)}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {receiptUrl ? (
                <>
                  {isPdfReceipt ? (
                    <iframe
                      src={receiptUrl}
                      title="Payment receipt"
                      className="w-full h-[400px] rounded-lg border bg-muted"
                    />
                  ) : (
                    <img
                      src={receiptUrl}
                      alt="Payment receipt"
                      className="w-full rounded-lg border bg-muted"
                    />
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" />
                      Open in new tab
                    </a>
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">No receipt uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The buyer did not upload a payment screenshot.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification actions */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Verification
              </CardTitle>
              <CardDescription>
                {order.status === "PENDING"
                  ? "Approve to grant access, or reject with a reason."
                  : "Update the status of this order."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderActions
                orderId={order.id}
                status={order.status as "PENDING" | "APPROVED" | "REJECTED"}
                approvedAt={order.approvedAt}
                rejectionReason={order.rejectionReason}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
