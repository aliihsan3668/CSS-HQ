import { db } from "@/lib/db";

// Cache settings in memory for 60s to avoid hitting DB on every request
let cache: { ts: number; data: Record<string, string> } = { ts: 0, data: {} };
const TTL = 60_000;

export async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now - cache.ts < TTL && Object.keys(cache.data).length > 0) {
    return cache.data;
  }
  const rows = await db.setting.findMany();
  const data: Record<string, string> = {};
  for (const r of rows) data[r.key] = r.value;
  cache = { ts: now, data };
  return data;
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const s = await getSettings();
  return s[key] ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  cache = { ts: 0, data: {} };
}

export function invalidateSettings() {
  cache = { ts: 0, data: {} };
}

// Pricing helpers
export const PRICING = {
  perSubject: 1500,
  compulsoryBundle: 6000,
  optionalBundle: 6000,
  fullBundle: 11000,
  launchBundle: 8999,
};

export async function getActivePricing() {
  const s = await getSettings();
  const launchEnabled = s.LAUNCH_PRICE_ENABLED === "true";
  return {
    perSubject: PRICING.perSubject,
    compulsoryBundle: Number(s.COMPULSORY_BUNDLE_PRICE || PRICING.compulsoryBundle),
    optionalBundle: Number(s.OPTIONAL_BUNDLE_PRICE || PRICING.optionalBundle),
    fullBundle: Number(s.FULL_BUNDLE_PRICE || PRICING.fullBundle),
    launchBundle: Number(s.LAUNCH_PRICE || PRICING.launchBundle),
    launchEnabled,
  };
}

export interface PaymentMethod {
  id: string;
  label: string;
  accountKey: string; // setting key for account number
  titleKey: string; // setting key for account title
  instructions: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "JAZZCASH",
    label: "JazzCash",
    accountKey: "JAZZCASH_NUMBER",
    titleKey: "JAZZCASH_TITLE",
    instructions: "Open JazzCash app → Send Money → Mobile Account → enter number & amount → confirm.",
  },
  {
    id: "EASYPaisa",
    label: "EasyPaisa",
    accountKey: "EASYPaisa_NUMBER",
    titleKey: "EASYPaisa_TITLE",
    instructions: "Open EasyPaisa app → Money Transfer → send to the mobile account number below.",
  },
  {
    id: "NAYAPAY",
    label: "NayaPay",
    accountKey: "NAYAPAY_ID",
    titleKey: "NAYAPAY_TITLE",
    instructions: "Open NayaPay → Send Money → enter NayaPay ID below → confirm.",
  },
  {
    id: "SADAPAY",
    label: "SadaPay",
    accountKey: "SADAPAY_NUMBER",
    titleKey: "SADAPAY_TITLE",
    instructions: "Open SadaPay → Send → enter number below → confirm.",
  },
  {
    id: "PAYONEER",
    label: "Payoneer",
    accountKey: "PAYONEER_ID",
    titleKey: "PAYONEER_TITLE",
    instructions: "Log in to your Payoneer account → Make a Payment → send to the email below.",
  },
];
