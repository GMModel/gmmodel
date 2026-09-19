import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFirstOrderDiscount, getFirstOrderPercent } from "@/lib/firstOrder";

// Checkout preview: is the signed-in customer eligible for the first-order discount?
export async function GET(request) {
  const subtotal = Number(new URL(request.url).searchParams.get("subtotal"));
  const user = await getCurrentUser();
  const result = await getFirstOrderDiscount(user, Number.isFinite(subtotal) ? subtotal : 0);
  // `percent` is returned for guests too so the checkout can invite them to sign in.
  const percent = user ? result.percent : await getFirstOrderPercent();
  return NextResponse.json({ ...result, percent, signedIn: Boolean(user) });
}
