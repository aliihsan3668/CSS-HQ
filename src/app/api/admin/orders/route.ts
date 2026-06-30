import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      items: { include: { subject: { select: { slug: true, name: true } } } },
    },
  });

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, action, rejectionReason } = body as {
    orderId: string;
    action: "APPROVE" | "REJECT";
    rejectionReason?: string;
  };

  if (!orderId || !action) {
    return NextResponse.json(
      { error: "Missing orderId or action" },
      { status: 400 }
    );
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: `Order already ${order.status}` },
      { status: 400 }
    );
  }

  if (action === "APPROVE") {
    // Grant access — create Purchase rows for every subject involved
    const subjectIds = new Set<string>();
    for (const item of order.items) {
      if (item.subjectId) {
        subjectIds.add(item.subjectId);
      } else if (item.bundleType) {
        // Resolve bundle → subjects
        const cat =
          item.bundleType === "COMPULSORY"
            ? "COMPULSORY"
            : item.bundleType === "OPTIONAL"
            ? "OPTIONAL"
            : null;
        if (cat) {
          const subjects = await db.subject.findMany({
            where: { category: cat },
            select: { id: true },
          });
          for (const s of subjects) subjectIds.add(s.id);
        } else {
          // FULL bundle → all subjects
          const subjects = await db.subject.findMany({ select: { id: true } });
          for (const s of subjects) subjectIds.add(s.id);
        }
      }
    }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "APPROVED", approvedAt: new Date() },
      });
      for (const subjectId of subjectIds) {
        await tx.purchase.upsert({
          where: { userId_subjectId: { userId: order.userId, subjectId } },
          create: { userId: order.userId, subjectId, orderId: order.id },
          update: {},
        });
      }
    });

    try {
      const { sendOrderApproved } = await import("@/lib/email");
      await sendOrderApproved(orderId);
    } catch (e) {
      console.error("Email failed:", e);
    }

    return NextResponse.json({ success: true, status: "APPROVED" });
  } else {
    await db.order.update({
      where: { id: orderId },
      data: { status: "REJECTED", rejectionReason: rejectionReason || null },
    });
    try {
      const { sendOrderRejected } = await import("@/lib/email");
      await sendOrderRejected(orderId, rejectionReason || "");
    } catch (e) {
      console.error("Email failed:", e);
    }
    return NextResponse.json({ success: true, status: "REJECTED" });
  }
}
