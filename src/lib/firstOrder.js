import { prisma } from "@/lib/prisma";

// First-order discount: a signed-in customer with no earlier *real* order gets
// `firstOrderPercent`% off (setting in Admin → Nội dung website → Cài đặt chung; 0 = off).
// It is applied server-side when the order is created, so the browser cannot fake it.
export const FIRST_ORDER_CODE = "FIRST_ORDER";
const DEFAULT_PERCENT = 10;

export async function getFirstOrderPercent(db = prisma) {
  try {
    const row = await db.siteContent.findUnique({ where: { locale: "settings" } });
    const raw = row?.data?.firstOrderPercent;
    if (raw === undefined || raw === "") return DEFAULT_PERCENT;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : DEFAULT_PERCENT;
  } catch {
    return DEFAULT_PERCENT;
  }
}

// An earlier order counts unless it was cancelled, failed, or is an unpaid online-payment
// attempt that was never completed (so abandoning MoMo/PayPal doesn't burn the offer).
async function hasEarlierOrder(user, db) {
  const count = await db.order.count({
    where: {
      OR: [{ userId: user.id }, { email: { equals: user.email, mode: "insensitive" } }],
      fulfillmentStatus: { not: "cancelled" },
      paymentStatus: { notIn: ["pending", "failed"] },
    },
  });
  return count > 0;
}

export async function getFirstOrderDiscount(user, subtotalUsd, db = prisma) {
  const none = { eligible: false, percent: 0, discountUsd: 0 };
  if (!user) return none;
  const percent = await getFirstOrderPercent(db);
  if (percent <= 0 || !(subtotalUsd > 0)) return none;
  if (await hasEarlierOrder(user, db)) return none;
  const discountUsd = Math.round(((subtotalUsd * percent) / 100) * 100) / 100;
  return { eligible: true, percent, discountUsd };
}
