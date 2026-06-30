"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Subset of Subject fields that the form manages
export interface SubjectFormData {
  name: string;
  shortDesc: string;
  longDesc: string;
  iconKey: string;
  accentColor: string;
  pricePkr: number;
  questionsCount: number;
  answersCount: number;
  mcqsCount: number;
  isActive: boolean;
}

interface SubjectEditFormProps {
  subjectId: string;
  initial: SubjectFormData;
}

const ICON_OPTIONS = [
  "BookOpen",
  "FileText",
  "Globe",
  "Scale",
  "Landmark",
  "PenLine",
  "FlaskConical",
  "Users",
  "GraduationCap",
  "Library",
  "ScrollText",
  "Newspaper",
];

const ACCENT_OPTIONS = ["emerald", "amber", "gold", "rose", "violet", "teal"];

export function SubjectEditForm({ subjectId, initial }: SubjectEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SubjectFormData>(initial);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SubjectFormData>(
    key: K,
    value: SubjectFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          shortDesc: form.shortDesc,
          longDesc: form.longDesc,
          iconKey: form.iconKey,
          accentColor: form.accentColor,
          pricePkr: Number(form.pricePkr),
          questionsCount: Number(form.questionsCount),
          answersCount: Number(form.answersCount),
          mcqsCount: Number(form.mcqsCount),
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Subject updated", {
        description: "Changes have been saved successfully.",
      });
      router.refresh();
    } catch (e) {
      toast.error("Failed to save", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pricePkr">Price (PKR)</Label>
          <Input
            id="pricePkr"
            type="number"
            min={0}
            value={form.pricePkr}
            onChange={(e) => update("pricePkr", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDesc">Short description</Label>
        <Input
          id="shortDesc"
          value={form.shortDesc}
          maxLength={140}
          onChange={(e) => update("shortDesc", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Shown on cards. Keep it under 140 chars.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="longDesc">Long description</Label>
        <Textarea
          id="longDesc"
          rows={6}
          value={form.longDesc}
          onChange={(e) => update("longDesc", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Shown on the subject detail page. Plain text — line breaks are preserved.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="iconKey">Icon</Label>
          <Select
            value={form.iconKey}
            onValueChange={(v) => update("iconKey", v)}
          >
            <SelectTrigger id="iconKey" className="w-full">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((icon) => (
                <SelectItem key={icon} value={icon}>
                  {icon}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accentColor">Accent color</Label>
          <Select
            value={form.accentColor}
            onValueChange={(v) => update("accentColor", v)}
          >
            <SelectTrigger id="accentColor" className="w-full">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {ACCENT_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="questionsCount">Questions</Label>
          <Input
            id="questionsCount"
            type="number"
            min={0}
            value={form.questionsCount}
            onChange={(e) => update("questionsCount", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="answersCount">Answers</Label>
          <Input
            id="answersCount"
            type="number"
            min={0}
            value={form.answersCount}
            onChange={(e) => update("answersCount", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mcqsCount">MCQs</Label>
          <Input
            id="mcqsCount"
            type="number"
            min={0}
            value={form.mcqsCount}
            onChange={(e) => update("mcqsCount", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex flex-col">
          <Label htmlFor="isActive" className="text-sm font-medium">
            Active (visible to buyers)
          </Label>
          <span className="text-xs text-muted-foreground">
            Inactive subjects are hidden from the browse page.
          </span>
        </div>
        <Switch
          id="isActive"
          checked={form.isActive}
          onCheckedChange={(v) => update("isActive", v)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={save}
          disabled={saving}
          className="bg-brand-gradient hover:opacity-90"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
        {saving && (
          <span className="text-xs text-muted-foreground">Saving…</span>
        )}
        {!saving && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            All changes are saved on submit
          </span>
        )}
      </div>
    </div>
  );
}
