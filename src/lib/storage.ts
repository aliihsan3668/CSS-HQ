// Storage abstraction layer.
// Uses Vercel Blob if BLOB_READ_WRITE_TOKEN is set; otherwise falls back to local /public/uploads.
// All persisted "storageKey" values are either:
//   - "blob:<pathname>" for Vercel Blob
//   - "local:<filename>" for local files in /public/uploads

import fs from "node:fs/promises";
import path from "node:path";
import { put, head, del } from "@vercel/blob";

const IS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureLocalDir() {
  try {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
  } catch {}
}

export interface UploadedFile {
  storageKey: string; // stored in DB
  source: "blob" | "local";
  size: number;
  mimeType: string;
}

export async function uploadFile(
  filename: string,
  data: Buffer,
  mimeType: string
): Promise<UploadedFile> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;

  if (IS_BLOB) {
    const blob = await put(`pdfs/${unique}`, data, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return {
      storageKey: `blob:${blob.pathname}`,
      source: "blob",
      size: data.length,
      mimeType,
    };
  }

  // Local fallback
  await ensureLocalDir();
  const localPath = path.join(LOCAL_DIR, unique);
  await fs.writeFile(localPath, data);
  return {
    storageKey: `local:${unique}`,
    source: "local",
    size: data.length,
    mimeType,
  };
}

// Returns a URL the browser can fetch (for <img>, <a href>, etc.)
export function getPublicUrl(storageKey: string): string {
  if (storageKey.startsWith("blob:")) {
    const pathname = storageKey.slice(5);
    // Vercel Blob serves at https://<account>.public.blob.vercel-storage.com/<pathname>
    // We construct from environment. For dev convenience we expose via /api/download proxy.
    return `/api/blob-proxy?key=${encodeURIComponent(storageKey)}`;
  }
  if (storageKey.startsWith("local:")) {
    return `/uploads/${storageKey.slice(6)}`;
  }
  return storageKey;
}

// Reads file bytes for protected download route
export async function readFileBytes(storageKey: string): Promise<{
  data: Buffer;
  mimeType: string;
} | null> {
  if (storageKey.startsWith("blob:")) {
    const pathname = storageKey.slice(5);
    const blobUrl = `https://${process.env.BLOB_BASE_URL || ""}/${pathname}`;
    // Use head then fetch — but simplest: fetch the blob's public URL.
    // Vercel Blob public URL is constructed from account + pathname. We rely on
    // getPublicUrl returning a proxy route, so we fetch through vercel/blob's head()
    // To avoid complex env wiring, we fetch the public URL directly if available.
    try {
      const res = await fetch(blobUrl);
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      return { data: buf, mimeType: "application/pdf" };
    } catch {
      return null;
    }
  }
  if (storageKey.startsWith("local:")) {
    const fname = storageKey.slice(6);
    const localPath = path.join(LOCAL_DIR, fname);
    try {
      const buf = await fs.readFile(localPath);
      return { data: buf, mimeType: "application/pdf" };
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith("blob:")) {
    const pathname = storageKey.slice(5);
    try {
      await del(`https://${process.env.BLOB_BASE_URL || ""}/${pathname}`);
    } catch {}
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
