import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Package,
  Users,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Settings,
  ShieldCheck,
  Sparkles,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview · Admin · CSS HQ",
};

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

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const [
    totalOrders,
    pendingOrders,
    approvedOrders,
    rejectedOrders,
    totalUsers,
    totalSubjects,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "APPROVED" } }),
    db.order.count({ where: { status: "REJECTED" } }),
    db.user.count(),
    db.subject.count(),
    db.order.aggregate({
      where: { status: "APPROVED" },
      _sum: { totalAmountPkr: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
    }),
  ]);

  const revenue = revenueAgg._sum.totalAmountPkr || 0;
  const hasPending = pendingOrders > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.email}. Here&apos;s what needs your attention.
          </p>
        </div>
        {hasPending && (
          <Button asChild className="bg-gold-gradient text-white hover:opacity-90">
            <Link href="/admin/orders?status=PENDING">
              <AlertTriangle className="size-4" />
              {pendingOrders} order{pendingOrders === 1 ? "" : "s"} awaiting review
            </Link>
          </Button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Revenue (approved)
                </p>
                <p className="text-2xl font-extrabold mt-1 text-gradient-brand">
                  {formatPkr(revenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  from {approvedOrders} approved order
                  {approvedOrders === 1 ? "" : "s"}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <TrendingUp className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending orders */}
        <Card
          className={
            hasPending
              ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-200 dark:ring-amber-900"
              : ""
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Pending orders
                </p>
                <p
                  className={
                    "text-2xl font-extrabold mt-1 " +
                    (hasPending
                      ? "text-amber-700 dark:text-amber-400"
                      : "")
                  }
                >
                  {pendingOrders}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasPending ? "Needs your review" : "All caught up"}
                </p>
              </div>
              <div
                className={
                  "size-10 rounded-xl grid place-items-center " +
                  (hasPending
                    ? "bg-amber-100 dark:bg-amber-950/40"
                    : "bg-muted")
                }
              >
                <Clock
                  className={
                    "size-5 " +
                    (hasPending
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground")
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total orders
                </p>
                <p className="text-2xl font-extrabold mt-1">{totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {approvedOrders} approved · {rejectedOrders} rejected
                </p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Package className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total users */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total users
                </p>
                <p className="text-2xl font-extrabold mt-1">{totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  across {totalSubjects} subjects
                </p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="h-auto justify-start py-3">
          <Link href="/admin/orders">
            <div className="size-9 rounded-md bg-primary/10 grid place-items-center mr-2">
              <Package className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Manage orders</span>
              <span className="text-xs text-muted-foreground font-normal">
                Review pending payments
              </span>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start py-3">
          <Link href="/admin/subjects">
            <div className="size-9 rounded-md bg-primary/10 grid place-items-center mr-2">
              <BookOpen className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Manage subjects</span>
              <span className="text-xs text-muted-foreground font-normal">
                Edit notes, upload PDFs
              </span>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start py-3">
          <Link href="/admin/settings">
            <div className="size-9 rounded-md bg-primary/10 grid place-items-center mr-2">
              <Settings className="size-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Edit settings</span>
              <span className="text-xs text-muted-foreground font-normal">
                Payment accounts, pricing
              </span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>The last 10 orders submitted</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                New orders will appear here as students submit them.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{shortId(order.id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {order.user.name || order.user.email}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {order.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatPkr(order.totalAmountPkr)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/orders/${order.id}`}>
                          Review
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Trust footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <ShieldCheck className="size-3.5" />
        Admin actions are logged. Approve orders only after verifying the receipt matches the order total.
      </div>
    </div>
  );
}
