import { NextResponse } from "next/server";
import { getAllSubjects, getBundles } from "@/lib/subjects";
import { getActivePricing } from "@/lib/settings";

export async function GET() {
  const [subjects, bundles, pricing] = await Promise.all([
    getAllSubjects(),
    getBundles(),
    getActivePricing(),
  ]);
  return NextResponse.json({ subjects, bundles, pricing });
}
