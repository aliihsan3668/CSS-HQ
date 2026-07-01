// Storage abstraction layer.
// Uses Vercel Blob if BLOB_READ_WRITE_TOKEN is set; otherwise falls back to /tmp (writable on Vercel + local).
// All persisted "storageKey" values are either:
//   - "blob:<full-url>" for Vercel Blob
//   - "local:<filename>" for local files in /tmp/css-hq-uploads

import fs from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";

const IS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join("/tmp", "css-hq-uploads");

function isVercel() {
  return !!process.env.VERCEL || !!process.env.VERCEL_ENV;
}

async function ensureLocalDir() {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
}

export interface UploadedFile {
  storageKey: string;
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
    try {
      const blob = await put(`pdfs/${unique}`, data, {
        access: "public",
        contentType: mimeType,
        addRandomSuffix: false,
      });
      return {
        storageKey: `blob:${blob.url}`,
        source: "blob",
        size: data.length,
        mimeType,
      };
    } catch (e: any) {
      console.error("[storage] Vercel Blob upload failed:", e?.message || e);
      throw new Error(
        `File upload failed (Vercel Blob error): ${e?.message || "unknown"}. ` +
          "Check that BLOB_READ_WRITE_TOKEN is set and the Blob store is connected to your Vercel project."
      );
    }
  }

  if (isVercel() && !IS_BLOB) {
    throw new Error(
      "Vercel Blob is not configured. On Vercel, you MUST set up Blob storage:\n" +
        "1. Go to your Vercel project → Storage tab → Create Blob Store\n" +
        "2. Connect it to your project (Vercel auto-adds BLOB_READ_WRITE_TOKEN)\n" +
        "3. Redeploy your project\n" +
        "See: https://vercel.com/docs/storage/vercel-blob"
    );
  }

  try {
    await ensureLocalDir();
    const localPath = path.join(LOCAL_DIR, unique);
    await fs.writeFile(localPath, data);
    return {
      storageKey: `local:${unique}`,
      source: "local",
      size: data.length,
      mimeType,
    };
  } catch (e: any) {
    console.error("[storage] Local file write failed:", e?.message || e);
    throw new Error(`Could not write file locally: ${e?.message || "unknown"}`);
  }
}

export async function readFileBytes(storageKey: string): Promise<{
  data: Buffer;
  mimeType: string;
} | null> {
  if (storageKey.startsWith("blob:http")) {
    const url = storageKey.slice(5);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.error(`[storage] Blob fetch failed: ${res.status} ${res.statusText}`);
        return null;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = url.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
      return { data: buf, mimeType: mime };
    } catch (e: any) {
      console.error("[storage] Blob fetch error:", e?.message || e);
      return null;
    }
  }

  if (storageKey.startsWith("blob:")) {
    const pathname = storageKey.slice(5);
    console.error(
      `[storage] Legacy blob key detected (pathname only): ${pathname}. Please re-upload.`
    );
    return null;
  }

  if (storageKey.startsWith("local:")) {
    const fname = storageKey.slice(6);
    const localPath = path.join(LOCAL_DIR, fname);
    try {
      const buf = await fs.readFile(localPath);
      const mime = fname.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
      return { data: buf, mimeType: mime };
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith("blob:http")) {
    const url = storageKey.slice(5);
    try {
      await del(url);
    } catch (e) {
      console.error("[storage] Blob delete failed:", e);
    }
    return;
  }
  if (storageKey.startsWith("blob:")) {
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
    localDir: LOCAL_DIR,
    canUpload: IS_BLOB || !isVercel(),
  };
}