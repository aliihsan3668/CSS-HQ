import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { subject: { select: { slug: true, name: true } } } },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Return receipt URL via proxy
  let receiptUrl: string | null = null;
  if (order.paymentScreenshot) {
    receiptUrl = `/api/blob-proxy?key=${encodeURIComponent(order.paymentScreenshot)}`;
  }
  return NextResponse.json({ order, receiptUrl });
}
