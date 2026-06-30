import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ purchases: [] });
  }
  const purchases = await db.purchase.findMany({
    where: { userId: user.id },
    include: {
      subject: {
        include: { pdfs: { select: { id: true, title: true, fileSize: true } } },
      },
    },
  });
  return NextResponse.json({ purchases });
}
