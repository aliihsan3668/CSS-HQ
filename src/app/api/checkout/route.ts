import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { getActivePricing } from "@/lib/settings";
import { getAllSubjects } from "@/lib/subjects";

const CheckoutSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(["subject", "bundle"]),
      id: z.string(),
      title: z.string(),
      pricePkr: z.number().int().min(0),
      subjectSlugs: z.array(z.string()).optional(),
      bundleType: z.enum(["COMPULSORY", "OPTIONAL", "FULL"]).optional(),
    })
  ),
  paymentMethod: z.enum([
    "JAZZCASH",
    "EASYPaisa",
    "NAYAPAY",
    "SADAPAY",
    "PAYONEER",
  ]),
  paymentNotes: z.string().max(500).optional(),
  receiptDataUrl: z.string().optional(), // data URL of uploaded receipt
  receiptFilename: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to place an order." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, paymentMethod, paymentNotes, receiptDataUrl, receiptFilename } =
      parsed.data;

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Server-side price verification — never trust client prices.
    const [allSubjects, pricing] = await Promise.all([
      getAllSubjects(),
      getActivePricing(),
    ]);
    const subjectBySlug = new Map(allSubjects.map((s) => [s.slug, s]));

    let totalAmount = 0;
    const orderItemsData: {
      subjectId: string | null;
      bundleType: string | null;
      title: string;
      pricePkr: number;
    }[] = [];

    for (const item of items) {
      if (item.type === "subject") {
        const subject = subjectBySlug.get(item.id);
        if (!subject) {
          return NextResponse.json(
            { error: `Subject not found: ${item.id}` },
            { status: 400 }
          );
        }
        const price = pricing.perSubject;
        totalAmount += price;
        orderItemsData.push({
          subjectId: subject.id,
          bundleType: null,
          title: subject.name,
          pricePkr: price,
        });
      } else {
        // Bundle
        let price = 0;
        let title = "";
        let bundleType: "COMPULSORY" | "OPTIONAL" | "FULL" | null = null;
        if (item.id === "bundle-compulsory") {
          price = pricing.compulsoryBundle;
          title = "Compulsory Bundle (6 subjects)";
          bundleType = "COMPULSORY";
        } else if (item.id === "bundle-optional") {
          price = pricing.optionalBundle;
          title = "Optional Bundle (6 subjects)";
          bundleType = "OPTIONAL";
        } else if (item.id === "bundle-full") {
          price = pricing.launchEnabled
            ? pricing.launchBundle
            : pricing.fullBundle;
          title = pricing.launchEnabled
            ? "Full Bundle — Launch Price (12 subjects)"
            : "Full Bundle (12 subjects)";
          bundleType = "FULL";
        } else {
          return NextResponse.json(
            { error: `Unknown bundle: ${item.id}` },
            { status: 400 }
          );
        }
        totalAmount += price;
        orderItemsData.push({
          subjectId: null,
          bundleType,
          title,
          pricePkr: price,
        });
      }
    }

    // Upload receipt if provided
    let receiptKey: string | null = null;
    if (receiptDataUrl && receiptFilename) {
      try {
        const buf = Buffer.from(
          receiptDataUrl.split(",")[1] || receiptDataUrl,
          "base64"
        );
        const mimeMatch = receiptDataUrl.match(/^data:(.+?);base64/);
        const mime = mimeMatch?.[1] || "image/png";
        const uploaded = await uploadFile(receiptFilename, buf, mime);
        receiptKey = uploaded.storageKey;
      } catch (e) {
        console.error("Receipt upload failed:", e);
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: user.id,
        totalAmountPkr: totalAmount,
        status: "PENDING",
        paymentMethod,
        paymentScreenshot: receiptKey,
        paymentNotes: paymentNotes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    // Best-effort email notification (don't fail order if email fails)
    try {
      const { sendOrderNotification } = await import("@/lib/email");
      await sendOrderNotification(order.id);
    } catch (e) {
      console.error("Email notification failed:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalAmountPkr: totalAmount,
      status: "PENDING",
    });
  } catch (e: any) {
    console.error("Checkout error:", e);
    return NextResponse.json(
      { error: e?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
