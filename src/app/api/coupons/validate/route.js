import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request) {
  const body = await request.json();
  const { code, subtotalUsd } = body ?? {};

  if (!code || typeof subtotalUsd !== "number") {
    return NextResponse.json({ valid: false, error: "invalid_request" }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotalUsd);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error, minOrderUsd: result.minOrderUsd });
  }

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    type: result.coupon.type,
    value: result.coupon.value,
    discountUsd: result.discountUsd,
  });
}
