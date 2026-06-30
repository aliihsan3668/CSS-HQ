"use client";

import { useState } from "react";
import {
  Save,
  Loader2,
  CreditCard,
  MessageCircle,
  DollarSign,
  FileText,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Settings = Record<string, string>;

interface SettingsFormProps {
  initial: Settings;
}

interface PaymentMethodDef {
  id: string;
  label: string;
  accountKey: string;
  titleKey: string;
  accountPlaceholder: string;
  accountLabel: string;
}

const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    id: "JAZZCASH",
    label: "JazzCash",
    accountKey: "JAZZCASH_NUMBER",
    titleKey: "JAZZCASH_TITLE",
    accountPlaceholder: "e.g. 0308 5202620",
    accountLabel: "JazzCash mobile number",
  },
  {
    id: "EASYPaisa",
    label: "EasyPaisa",
    accountKey: "EASYPaisa_NUMBER",
    titleKey: "EASYPaisa_TITLE",
    accountPlaceholder: "e.g. 0308 5202620",
    accountLabel: "EasyPaisa mobile number",
  },
  {
    id: "NAYAPAY",
    label: "NayaPay",
    accountKey: "NAYAPAY_ID",
    titleKey: "NAYAPAY_TITLE",
    accountPlaceholder: "e.g. aliihsan",
    accountLabel: "NayaPay ID",
  },
  {
    id: "SADAPAY",
    label: "SadaPay",
    accountKey: "SADAPAY_NUMBER",
    titleKey: "SADAPAY_TITLE",
    accountPlaceholder: "e.g. 0308 5202620",
    accountLabel: "SadaPay number",
  },
  {
    id: "PAYONEER",
    label: "Payoneer",
    accountKey: "PAYONEER_ID",
    titleKey: "PAYONEER_TITLE",
    accountPlaceholder: "e.g. aliihsan.devs@gmail.com",
    accountLabel: "Payoneer email / ID",
  },
];

function SettingsRow({
  id,
  label,
  value,
  placeholder,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SaveBar({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-1">
      <Button onClick={onSave} disabled={saving} className="bg-brand-gradient hover:opacity-90">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save
      </Button>
    </div>
  );
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingInstructions, setSavingInstructions] = useState(false);

  function update(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function saveSection(
    keys: string[],
    setter: (b: boolean) => void,
    successMsg: string
  ) {
    setter(true);
    try {
      const body: Record<string, string> = {};
      for (const k of keys) body[k] = settings[k] ?? "";
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(successMsg);
    } catch (e) {
      toast.error("Failed to save", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setter(false);
    }
  }

  const paymentKeys = PAYMENT_METHODS.flatMap((m) => [m.accountKey, m.titleKey]);
  const supportKeys = ["SUPPORT_WHATSAPP", "SUPPORT_EMAIL"];
  const pricingKeys = [
    "LAUNCH_PRICE_ENABLED",
    "LAUNCH_PRICE",
    "FULL_BUNDLE_PRICE",
    "COMPULSORY_BUNDLE_PRICE",
    "OPTIONAL_BUNDLE_PRICE",
  ];
  const instructionKeys = ["BANK_TRANSFER_INSTRUCTIONS"];

  return (
    <div className="space-y-6">
      {/* Payment accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-brand-gradient/10 grid place-items-center">
              <CreditCard className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Payment accounts</CardTitle>
              <CardDescription>
                These numbers are shown to buyers on the checkout page. Keep them current.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {PAYMENT_METHODS.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                <h4 className="text-sm font-semibold">{m.label}</h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SettingsRow
                  id={m.accountKey}
                  label={m.accountLabel}
                  value={settings[m.accountKey] ?? ""}
                  placeholder={m.accountPlaceholder}
                  onChange={(v) => update(m.accountKey, v)}
                  disabled={savingPayments}
                />
                <SettingsRow
                  id={m.titleKey}
                  label="Account title (name on account)"
                  value={settings[m.titleKey] ?? ""}
                  placeholder="e.g. Ali Ihsan"
                  onChange={(v) => update(m.titleKey, v)}
                  disabled={savingPayments}
                />
              </div>
            </div>
          ))}
          <SaveBar
            saving={savingPayments}
            onSave={() =>
              saveSection(paymentKeys, setSavingPayments, "Payment accounts saved")
            }
          />
        </CardContent>
      </Card>

      {/* Support contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-brand-gradient/10 grid place-items-center">
              <MessageCircle className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Support contact</CardTitle>
              <CardDescription>
                Shown on the dashboard, checkout, and order pages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsRow
            id="SUPPORT_WHATSAPP"
            label="WhatsApp number (with country code, no +)"
            value={settings.SUPPORT_WHATSAPP ?? ""}
            placeholder="e.g. 923085202620"
            onChange={(v) => update("SUPPORT_WHATSAPP", v)}
            disabled={savingSupport}
          />
          <SettingsRow
            id="SUPPORT_EMAIL"
            label="Support email"
            value={settings.SUPPORT_EMAIL ?? ""}
            placeholder="e.g. aliihsan.devs@gmail.com"
            onChange={(v) => update("SUPPORT_EMAIL", v)}
            disabled={savingSupport}
          />
          <SaveBar
            saving={savingSupport}
            onSave={() =>
              saveSection(supportKeys, setSavingSupport, "Support contact saved")
            }
          />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-brand-gradient/10 grid place-items-center">
              <DollarSign className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Bundle prices (PKR). Per-subject price is fixed at 1,500 and not editable here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col">
              <Label htmlFor="LAUNCH_PRICE_ENABLED" className="text-sm font-medium">
                Launch price enabled
              </Label>
              <span className="text-xs text-muted-foreground">
                When on, the Full Bundle is sold at the launch price instead of the standard price.
              </span>
            </div>
            <Switch
              id="LAUNCH_PRICE_ENABLED"
              checked={settings.LAUNCH_PRICE_ENABLED === "true"}
              onCheckedChange={(v) =>
                update("LAUNCH_PRICE_ENABLED", v ? "true" : "false")
              }
              disabled={savingPricing}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsRow
              id="LAUNCH_PRICE"
              label="Launch price (Full Bundle)"
              value={settings.LAUNCH_PRICE ?? ""}
              placeholder="8999"
              onChange={(v) => update("LAUNCH_PRICE", v)}
              disabled={savingPricing}
            />
            <SettingsRow
              id="FULL_BUNDLE_PRICE"
              label="Full Bundle price (standard)"
              value={settings.FULL_BUNDLE_PRICE ?? ""}
              placeholder="11000"
              onChange={(v) => update("FULL_BUNDLE_PRICE", v)}
              disabled={savingPricing}
            />
            <SettingsRow
              id="COMPULSORY_BUNDLE_PRICE"
              label="Compulsory Bundle price"
              value={settings.COMPULSORY_BUNDLE_PRICE ?? ""}
              placeholder="6000"
              onChange={(v) => update("COMPULSORY_BUNDLE_PRICE", v)}
              disabled={savingPricing}
            />
            <SettingsRow
              id="OPTIONAL_BUNDLE_PRICE"
              label="Optional Bundle price"
              value={settings.OPTIONAL_BUNDLE_PRICE ?? ""}
              placeholder="6000"
              onChange={(v) => update("OPTIONAL_BUNDLE_PRICE", v)}
              disabled={savingPricing}
            />
          </div>
          <SaveBar
            saving={savingPricing}
            onSave={() =>
              saveSection(pricingKeys, setSavingPricing, "Pricing saved")
            }
          />
        </CardContent>
      </Card>

      {/* Bank transfer instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-brand-gradient/10 grid place-items-center">
              <FileText className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Bank transfer instructions</CardTitle>
              <CardDescription>
                Shown to buyers before they upload a receipt.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            id="BANK_TRANSFER_INSTRUCTIONS"
            rows={5}
            value={settings.BANK_TRANSFER_INSTRUCTIONS ?? ""}
            placeholder="e.g. Send the exact amount, take a clear screenshot, and upload it below."
            disabled={savingInstructions}
            onChange={(e) => update("BANK_TRANSFER_INSTRUCTIONS", e.target.value)}
          />
          <SaveBar
            saving={savingInstructions}
            onSave={() =>
              saveSection(instructionKeys, setSavingInstructions, "Instructions saved")
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
