import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setSetting, getSettings, invalidateSettings } from "@/lib/settings";

const ALLOWED_KEYS = [
  "JAZZCASH_NUMBER",
  "JAZZCASH_TITLE",
  "EASYPaisa_NUMBER",
  "EASYPaisa_TITLE",
  "NAYAPAY_ID",
  "NAYAPAY_TITLE",
  "SADAPAY_NUMBER",
  "SADAPAY_TITLE",
  "PAYONEER_ID",
  "PAYONEER_TITLE",
  "SUPPORT_WHATSAPP",
  "SUPPORT_EMAIL",
  "LAUNCH_PRICE_ENABLED",
  "LAUNCH_PRICE",
  "FULL_BUNDLE_PRICE",
  "COMPULSORY_BUNDLE_PRICE",
  "OPTIONAL_BUNDLE_PRICE",
  "BANK_TRANSFER_INSTRUCTIONS",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = (await req.json()) as Record<string, string>;
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    await setSetting(key, body[key]);
  }
  invalidateSettings();
  return NextResponse.json({ success: true });
}
