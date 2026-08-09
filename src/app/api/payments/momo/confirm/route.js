import { NextResponse } from "next/server";
import { applyMomoResult } from "@/lib/momo";

// Called by the /checkout/result page with the query-string fields MoMo
// attached to the browser redirectUrl. Same signed fields and verification
// as the IPN webhook, so it's just as trustworthy — and it works without a
// public HTTPS callback URL, since it's the user's own browser round-trip.
export async function POST(request) {
  const params = await request.json();
  const paymentStatus = await applyMomoResult(params);

  if (paymentStatus === null) {
    return NextResponse.json({ error: "Invalid signature or order" }, { status: 400 });
  }
  return NextResponse.json({ paymentStatus });
}
