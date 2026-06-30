import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const Schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, phone, password } = parsed.data;
  const lower = email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }
  const hash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email: lower, phone, passwordHash: hash, role: "STUDENT" },
  });
  return NextResponse.json({ success: true });
}
