import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [brands, scales] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.scale.findMany({ orderBy: { label: "asc" } }),
  ]);

  return NextResponse.json({ brands, scales });
}
