import { prisma } from "@/lib/prisma";

// Shared validation used by both the checkout preview endpoint and the
// order-creation route, so the two can never disagree about whether a code
// is valid or how much it discounts.
export async function validateCoupon(code, subtotalUsd) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return { valid: false, error: "empty" };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active) return { valid: false, error: "not_found" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: "expired" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { valid: false, error: "used_up" };
  if (coupon.minOrderUsd && subtotalUsd < coupon.minOrderUsd) {
    return { valid: false, error: "min_order", minOrderUsd: coupon.minOrderUsd };
  }

  const rawDiscount = coupon.type === "percent" ? (subtotalUsd * coupon.value) / 100 : coupon.value;
  const discountUsd = Math.min(rawDiscount, subtotalUsd);

  return { valid: true, coupon, discountUsd };
}
