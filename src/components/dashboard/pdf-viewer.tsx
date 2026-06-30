"use client";

import { useState } from "react";
import { FileText, Download, ExternalLink, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PdfViewerPdf {
  id: string;
  title: string;
  fileSize: number;
}

interface PdfViewerProps {
  subjectId: string;
  subjectName?: string;
  pdfs: PdfViewerPdf[];
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let unit = 0;
  let val = bytes;
  while (val >= 1024 && unit < units.length - 1) {
    val /= 1024;
    unit++;
  }
  return `${val.toFixed(val < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

export function PdfViewer({ subjectId, subjectName, pdfs }: PdfViewerProps) {
  const [selectedPdfId, setSelectedPdfId] = useState<string>(
    pdfs[0]?.id ?? ""
  );

  if (pdfs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center">
        <File className="size-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No PDFs have been uploaded for this subject yet. Please check back
          soon or contact support.
        </p>
      </div>
    );
  }

  const selectedPdf =
    pdfs.find((p) => p.id === selectedPdfId) ?? pdfs[0];
  const downloadUrl = `/api/download/${subjectId}?pdfId=${selectedPdf.id}`;

  // Single PDF — show directly
  if (pdfs.length === 1) {
    const pdf = pdfs[0];
    const url = `/api/download/${subjectId}?pdfId=${pdf.id}`;
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
              <FileText className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{pdf.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(pdf.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 mr-1.5" />
                Open in new tab
              </a>
            </Button>
            <Button asChild size="sm" className="bg-brand-gradient hover:opacity-90">
              <a href={url} download>
                <Download className="size-4 mr-1.5" />
                Download
              </a>
            </Button>
          </div>
        </div>
        <iframe
          src={url}
          title={pdf.title}
          className="w-full h-[80vh] rounded-lg border border-border bg-card"
        />
      </div>
    );
  }

  // Multiple PDFs — sidebar list + viewer
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar (desktop) / list (mobile) */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span className="text-sm font-semibold">
              {pdfs.length} documents
            </span>
          </div>
          <ScrollArea className="h-[60vh] lg:h-[70vh]">
            <ul className="p-2 space-y-1">
              {pdfs.map((pdf, idx) => {
                const url = `/api/download/${subjectId}?pdfId=${pdf.id}`;
                const active = pdf.id === selectedPdfId;
                return (
                  <li key={pdf.id}>
                    <button
                      onClick={() => setSelectedPdfId(pdf.id)}
                      className={cn(
                        "w-full text-left rounded-lg p-3 transition-colors border",
                        active
                          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                          : "bg-card border-transparent hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            "size-8 rounded-lg grid place-items-center shrink-0",
                            active
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium leading-tight line-clamp-2",
                              active && "text-primary"
                            )}
                          >
                            {pdf.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {formatBytes(pdf.fileSize)}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 font-medium"
                            >
                              #{idx + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 text-[11px] font-medium transition-colors",
                          active
                            ? "text-primary hover:opacity-80"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Download className="size-3" />
                        Download only
                      </a>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
      </aside>

      {/* Main viewer */}
      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
              <FileText className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {selectedPdf.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(selectedPdf.fileSize)}
                {subjectName ? ` · ${subjectName}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" variant="outline">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 mr-1.5" />
                New tab
              </a>
            </Button>
            <Button asChild size="sm" className="bg-brand-gradient hover:opacity-90">
              <a href={downloadUrl} download>
                <Download className="size-4 mr-1.5" />
                Download
              </a>
            </Button>
          </div>
        </div>
        <iframe
          key={selectedPdf.id}
          src={downloadUrl}
          title={selectedPdf.title}
          className="w-full h-[80vh] rounded-lg border border-border bg-card"
        />
      </div>
    </div>
  );
}
