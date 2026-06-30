import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Package, Search } from "lucide-react";
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
  title: "Orders · Admin · CSS HQ",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  APPROVED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  REJECTED:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
};

const STATUS_TABS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

function shortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

function paymentMethodLabel(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase();
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const sp = await searchParams;
  const statusFilter = sp.status?.toUpperCase();
  const validStatus =
    statusFilter === "PENDING" ||
    statusFilter === "APPROVED" ||
    statusFilter === "REJECTED"
      ? statusFilter
      : null;

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: validStatus ? { status: validStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        items: {
          include: { subject: { select: { slug: true, name: true } } },
        },
      },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const countMap: Record<string, number> = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const r of counts) countMap[r.status] = r._count;
  countMap.ALL = countMap.PENDING + countMap.APPROVED + countMap.REJECTED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and verify payment receipts. Showing {orders.length} of{" "}
          {countMap.ALL} total orders.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-premium">
        {STATUS_TABS.map((tab) => {
          const isActive =
            (tab.id === "ALL" && !validStatus) || validStatus === tab.id;
          const href =
            tab.id === "ALL" ? "/admin/orders" : `/admin/orders?status=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              className={
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap " +
                (isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground")
              }
            >
              {tab.label}
              <span
                className={
                  "text-xs rounded-full px-1.5 py-0.5 " +
                  (isActive
                    ? "bg-primary-foreground/20"
                    : "bg-background/70")
                }
              >
                {countMap[tab.id]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            {validStatus
              ? `${validStatus.charAt(0) + validStatus.slice(1).toLowerCase()} orders`
              : "All orders"}
          </CardTitle>
          <CardDescription>
            Most recent first. Click any row to review the order and verify the receipt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {validStatus
                  ? `There are no ${validStatus.toLowerCase()} orders right now.`
                  : "Orders will appear here as students submit them."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        #{shortId(order.id)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {order.user.name || "—"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {order.user.email}
                        </span>
                        {order.user.phone && (
                          <span className="text-xs text-muted-foreground/80">
                            {order.user.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 max-w-[260px]">
                        {order.items.slice(0, 2).map((item) => (
                          <span
                            key={item.id}
                            className="text-xs truncate text-foreground/90"
                            title={item.title}
                          >
                            {item.title}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold whitespace-nowrap">
                      {formatPkr(order.totalAmountPkr)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {paymentMethodLabel(order.paymentMethod)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="group-hover:text-primary"
                        >
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

      {orders.length === 50 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          Showing the latest 50 orders. Use the status filters above to narrow down.
        </div>
      )}
    </div>
  );
}
