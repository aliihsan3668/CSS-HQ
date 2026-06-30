import { notFound } from "next/navigation";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings · Admin · CSS HQ",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  // Bust the in-memory cache to always show fresh values here.
  const rows = await db.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  // Touch getSettings too so the cache is primed for the public route.
  await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <SettingsIcon className="size-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update payment accounts, support contact, and pricing. Changes apply
          across the entire site immediately.
        </p>
      </div>

      <SettingsForm initial={settings} />

      {/* Info card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6 flex items-start gap-3">
          <div className="size-9 rounded-md bg-brand-gradient/10 grid place-items-center shrink-0">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">How buyers see this</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Payment account numbers and titles are shown on the checkout page
              via the public <code className="text-xs">/api/payment-methods</code>{" "}
              endpoint. The support contact appears on the dashboard, checkout,
              and order pages. Pricing is reflected on the subjects browse page,
              cart, and checkout. Settings are cached for 60 seconds on the
              public side, so it can take up to a minute for changes to appear
              for buyers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
