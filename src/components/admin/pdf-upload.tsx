"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PdfItem {
  id: string;
  title: string;
  fileSize: number;
  createdAt: string;
}

interface PdfUploadProps {
  subjectId: string;
  pdfs: PdfItem[];
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function PdfUpload({ subjectId, pdfs }: PdfUploadProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      e.target.value = "";
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast.error("PDF too large", { description: "Max 25 MB." });
      e.target.value = "";
      return;
    }
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "));
    }
  }

  async function upload() {
    if (!file) {
      toast.error("Select a PDF first");
      return;
    }
    setUploading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim() || file.name);

      const res = await fetch(`/api/admin/subjects/${subjectId}/pdfs`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      let data: any;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text.slice(0, 500) || `Server returned ${res.status}` };
      }

      if (!res.ok) {
        throw new Error(data?.error || `Upload failed (HTTP ${res.status})`);
      }

      toast.success("PDF uploaded", {
        description: `${title || file.name} is now available to buyers.`,
      });
      setFile(null);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e: any) {
      const msg =
        e?.name === "AbortError"
          ? "Upload timed out (90s). Check your connection and try again."
          : e instanceof Error
          ? e.message
          : "Unknown error";
      toast.error("Upload failed", {
        description: msg,
        duration: 10_000,
      });
    } finally {
      clearTimeout(timeout);
      setUploading(false);
    }
  }

  async function removePdf(pdfId: string, pdfTitle: string) {
    setDeletingId(pdfId);
    try {
      const url = `/api/admin/subjects/${subjectId}/pdfs?pdfId=${encodeURIComponent(pdfId)}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("PDF removed", { description: pdfTitle });
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dashed p-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pdf-file">PDF file</Label>
          <Input
            id="pdf-file"
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
            disabled={uploading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pdf-title">Title (optional)</Label>
          <Input
            id="pdf-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Current Affairs — Complete Notes 2025"
            disabled={uploading}
          />
        </div>
        {uploading && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            Uploading… please wait
          </p>
        )}
        <Button
          onClick={upload}
          disabled={!file || uploading}
          className="bg-brand-gradient hover:opacity-90"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload PDF
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">
          Uploaded PDFs{" "}
          <span className="text-muted-foreground font-normal">({pdfs.length})</span>
        </h4>
        {pdfs.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            <FileText className="size-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-medium">No PDFs yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload the first PDF using the form above.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-premium pr-1">
            {pdfs.map((pdf, idx) => (
              <li
                key={pdf.id}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="size-9 rounded-md bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 grid place-items-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                    <p className="text-sm font-medium truncate">{pdf.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatSize(pdf.fileSize)} · {new Date(pdf.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePdf(pdf.id, pdf.title)}
                  disabled={deletingId === pdf.id}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                >
                  {deletingId === pdf.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pdfs.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            These PDFs are served through the protected download route — only buyers (or admins) can access them.
          </p>
        </div>
      )}
      {pdfs.length === 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Students who buy this subject will see an empty notes viewer until at least one PDF is uploaded.
          </p>
        </div>
      )}
    </div>
  );
}
