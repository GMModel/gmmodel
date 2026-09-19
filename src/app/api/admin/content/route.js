import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { dictionary } from "@/lib/dictionary";
import { flattenStrings, isListPath, sanitizeListOverride } from "@/lib/contentUtils";

export async function GET(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const locale = new URL(request.url).searchParams.get("locale") ?? "vi";
  if (!dictionary[locale]) return NextResponse.json({ error: "Ngôn ngữ không hợp lệ" }, { status: 400 });

  const row = await prisma.siteContent.findUnique({ where: { locale } });
  return NextResponse.json({ overrides: row?.data ?? {} });
}

export async function PUT(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { locale, overrides } = (await request.json()) ?? {};
  if (!dictionary[locale] || !overrides || typeof overrides !== "object") {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const validPaths = new Set(flattenStrings(dictionary[locale]).map((f) => f.path));
  const clean = {};
  for (const [path, value] of Object.entries(overrides)) {
    if (Array.isArray(value)) {
      const list = isListPath(path) ? sanitizeListOverride(path, value) : null;
      if (list && list.length > 0) clean[path] = list;
      continue;
    }
    if (validPaths.has(path) && typeof value === "string" && value.trim()) {
      clean[path] = value;
    }
  }

  await prisma.siteContent.upsert({
    where: { locale },
    create: { locale, data: clean },
    update: { data: clean },
  });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, count: Object.keys(clean).length });
}
