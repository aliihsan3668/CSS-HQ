import { NextResponse } from "next/server";
import { getSettings, PAYMENT_METHODS } from "@/lib/settings";

// Public endpoint — returns payment methods with their resolved account + title
// text, plus the global bank-transfer instructions string. Safe to expose to
// buyers (only the public-facing fields from settings are returned).
export async function GET() {
  const settings = await getSettings();

  const methods = PAYMENT_METHODS.map((m) => ({
    id: m.id,
    label: m.label,
    account: settings[m.accountKey] ?? "",
    title: settings[m.titleKey] ?? "",
    instructions: m.instructions,
  }));

  const instructions =
    settings.BANK_TRANSFER_INSTRUCTIONS ||
    "Pay the exact amount to any of the methods below. After payment, upload a screenshot/receipt. Your access is granted within minutes after verification.";

  return NextResponse.json({ methods, instructions });
}
