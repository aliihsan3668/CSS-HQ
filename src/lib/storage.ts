import fs from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";

const IS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join("/tmp", "css-hq-uploads");
const MAX_DB_SIZE = 25 * 1024 * 1024;

function isVercel() {
  return !!process.env.VERCEL || !!process.env.VERCEL_ENV;
}

export interface UploadedFile {
  storageKey: string;
  source: "db" | "blob" | "local";
  size: number;
  mimeType: string;
  data: Buffer;
}

export async function uploadFile(
  filename: string,
  data: Buffer,
  mimeType: string
): Promise<UploadedFile> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const size = data.length;

  if (IS_BLOB && size > MAX_DB_SIZE) {
    try {
      const unique = `${Date.now()}-${safeName}`;
      const blob = await put(`pdfs/${unique}`, data, {
        access: "public",
        contentType: mimeType,
        addRandomSuffix: false,
      });
      return {
        storageKey: `blob:${blob.url}`,
        source: "blob",
        size,
        mimeType,
        data,
      };
    } catch (e: any) {
      throw new Error(`Vercel Blob upload failed: ${e?.message}`);
    }
  }

  if (size > MAX_DB_SIZE && isVercel() && !IS_BLOB) {
    throw new Error(
      `File is too large (${(size / 1024 / 1024).toFixed(1)} MB). Max is 25MB without Vercel Blob.`
    );
  }

  return {
    storageKey: "db:pending",
    source: "db",
    size,
    mimeType,
    data,
  };
}

export async function readFileBytes(storageKey: string): Promise<{
  data: Buffer;
  mimeType: string;
} | null> {
  if (storageKey.startsWith("db:")) {
    const pdfId = storageKey.slice(3);
    if (pdfId === "pending") return null;
    try {
      const pdf = await db.subjectPdf.findUnique({
        where: { id: pdfId },
        select: { dataBytes: true, mimeType: true },
      });
      if (!pdf || !pdf.dataBytes) return null;
      return {
        data: Buffer.from(pdf.dataBytes),
        mimeType: pdf.mimeType || "application/pdf",
      };
    } catch (e: any) {
      console.error("[storage] DB read error:", e?.message);
      return null;
    }
  }

  if (storageKey.startsWith("blob:http")) {
    const url = storageKey.slice(5);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = url.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
      return { data: buf, mimeType: mime };
    } catch {
      return null;
    }
  }

  if (storageKey.startsWith("blob:")) {
    return null;
  }

  if (storageKey.startsWith("local:")) {
    const fname = storageKey.slice(6);
    try {
      const buf = await fs.readFile(path.join(LOCAL_DIR, fname));
      const mime = fname.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
      return { data: buf, mimeType: mime };
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith("db:")) return;
  if (storageKey.startsWith("blob:http")) {
    const url = storageKey.slice(5);
    try {
      await del(url);
    } catch {}
    return;
  }
  if (storageKey.startsWith("local:")) {
    const fname = storageKey.slice(6);
    try {
      await fs.unlink(path.join(LOCAL_DIR, fname));
    } catch {}
  }
}

export function isBlobConfigured() {
  return IS_BLOB;
}

export function getStorageStatus() {
  return {
    blobConfigured: IS_BLOB,
    isVercel: isVercel(),
    canUpload: true,
    storageMode: "database" as const,
    maxDbSizeMb: 25,
  };
}