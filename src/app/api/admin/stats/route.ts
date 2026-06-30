import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [totalOrders, pendingOrders, approvedOrders, rejectedOrders, totalUsers, totalSubjects] =
    await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "APPROVED" } }),
      db.order.count({ where: { status: "REJECTED" } }),
      db.user.count(),
      db.subject.count(),
    ]);

  const revenueAgg = await db.order.aggregate({
    where: { status: "APPROVED" },
    _sum: { totalAmountPkr: true },
  });

  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { email: true, name: true } },
      items: true,
    },
  });

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    approvedOrders,
    rejectedOrders,
    totalUsers,
    totalSubjects,
    revenue: revenueAgg._sum.totalAmountPkr || 0,
    recentOrders,
  });
}
