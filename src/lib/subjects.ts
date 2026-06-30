import { db } from "@/lib/db";

export interface SubjectPublic {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  iconKey: string;
  accentColor: string;
  order: number;
  pricePkr: number;
  questionsCount: number;
  answersCount: number;
  mcqsCount: number;
  pastPapersFrom: number;
  pastPapersTo: number;
  features: string[];
  samples: { q: string; likelihood: string }[];
  pdfCount: number;
}

export function toPublicSubject(s: any): SubjectPublic {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category,
    shortDesc: s.shortDesc,
    longDesc: s.longDesc,
    iconKey: s.iconKey,
    accentColor: s.accentColor,
    order: s.order,
    pricePkr: s.pricePkr,
    questionsCount: s.questionsCount,
    answersCount: s.answersCount,
    mcqsCount: s.mcqsCount,
    pastPapersFrom: s.pastPapersFrom,
    pastPapersTo: s.pastPapersTo,
    features: JSON.parse(s.featuresJson || "[]"),
    samples: JSON.parse(s.sampleJson || "[]"),
    pdfCount: s.pdfs?.length ?? 0,
  };
}

export async function getAllSubjects(): Promise<SubjectPublic[]> {
  const subjects = await db.subject.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { pdfs: { select: { id: true } } },
  });
  return subjects.map(toPublicSubject);
}

export async function getSubjectBySlug(slug: string): Promise<SubjectPublic | null> {
  const s = await db.subject.findUnique({
    where: { slug },
    include: { pdfs: { select: { id: true } } },
  });
  if (!s) return null;
  return toPublicSubject(s);
}

export async function getSubjectById(id: string) {
  return db.subject.findUnique({ where: { id } });
}

export async function getSubjectsByCategory(category: string) {
  const all = await getAllSubjects();
  return all.filter((s) => s.category === category);
}

export async function getBundles() {
  const all = await getAllSubjects();
  const compulsory = all.filter((s) => s.category === "COMPULSORY");
  const optional = all.filter((s) => s.category === "OPTIONAL");
  return {
    compulsory: {
      slugs: compulsory.map((s) => s.slug),
      title: "Compulsory Bundle (6 subjects)",
    },
    optional: {
      slugs: optional.map((s) => s.slug),
      title: "Optional Bundle (6 subjects)",
    },
    full: {
      slugs: all.map((s) => s.slug),
      title: "Full Bundle (all 12 subjects)",
    },
  };
}

export async function getUserPurchasedSubjectSlugs(userId: string): Promise<Set<string>> {
  const purchases = await db.purchase.findMany({
    where: { userId },
    select: { subject: { select: { slug: true } } },
  });
  return new Set(purchases.map((p) => p.subject.slug));
}

export async function userOwnsSubject(userId: string, subjectId: string): Promise<boolean> {
  const p = await db.purchase.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  });
  return !!p;
}
