import { NextResponse } from "next/server";
import { applyMomoResult } from "@/lib/momo";

// Server-to-server notification from MoMo. Requires ipnUrl to be a publicly
// reachable HTTPS address in production — MoMo cannot reach a localhost URL,
// so during local development the browser redirectUrl round-trip (handled by
// /checkout/result -> /api/payments/momo/confirm) is what actually confirms
// payment; this route only matters once the app is deployed behind a real
// domain.
export async function POST(request) {
  const params = await request.json();
  await applyMomoResult(params);
  return NextResponse.json({ message: "ok" });
}
