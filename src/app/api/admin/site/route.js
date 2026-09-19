import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { SETTING_FIELDS, isSafeUrl, sanitizeTiles, sanitizeFooter, sanitizePages, sanitizeCountries } from "@/lib/contentUtils";
import { getSiteData } from "@/lib/siteContent";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { settings, banners, tiles, footer, pages, countries } = await getSiteData();
  return NextResponse.json({ settings, banners, tiles, footer, pages, countries });
}

export async function PUT(request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) ?? {};
  const { settings, banners } = body;
  const writes = [];
  const resets = [];
  const bad = () => NextResponse.json({ error: "Dữ liệu hoặc link không hợp lệ (link phải bắt đầu bằng http(s):// hoặc /)" }, { status: 400 });

  // Structured blocks: an object saves, null resets to the built-in default.
  for (const [id, sanitize] of [["tiles", sanitizeTiles], ["footer", sanitizeFooter], ["pages", sanitizePages], ["countries", sanitizeCountries]]) {
    if (!(id in body)) continue;
    if (body[id] === null) {
      resets.push(id);
      continue;
    }
    const data = sanitize(body[id]);
    if (!data) return bad();
    writes.push({ id, data });
  }

  if (settings && typeof settings === "object") {
    const clean = {};
    for (const f of SETTING_FIELDS) {
      const value = String(settings[f.key] ?? "").trim().slice(0, 500);
      if (f.url && value && !isSafeUrl(value)) {
        return NextResponse.json({ error: `${f.label}: link phải bắt đầu bằng http:// hoặc https://` }, { status: 400 });
      }
      clean[f.key] = value;
    }
    writes.push({ id: "settings", data: clean });
  }

  if (Array.isArray(banners)) {
    const clean = [];
    for (const b of banners.slice(0, 20)) {
      const imageUrl = String(b?.imageUrl ?? "").trim();
      const link = String(b?.link ?? "").trim();
      const alt = String(b?.alt ?? "").trim().slice(0, 200);
      if (!imageUrl) continue;
      if (!isSafeUrl(imageUrl) || (link && !isSafeUrl(link))) {
        return NextResponse.json({ error: "Link ảnh/đích phải bắt đầu bằng http(s):// hoặc /" }, { status: 400 });
      }
      clean.push({ imageUrl, link, alt });
    }
    writes.push({ id: "banners", data: clean });
  }

  if (writes.length === 0 && resets.length === 0) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  for (const w of writes) {
    await prisma.siteContent.upsert({
      where: { locale: w.id },
      create: { locale: w.id, data: w.data },
      update: { data: w.data },
    });
  }
  if (resets.length) await prisma.siteContent.deleteMany({ where: { locale: { in: resets } } });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
