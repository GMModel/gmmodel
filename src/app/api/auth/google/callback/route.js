import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("oauth_state")?.value;
  const next = request.cookies.get("oauth_next")?.value || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=google_state", request.url));
  }

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_token", request.url));
    }
    const tokens = await tokenRes.json();

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_profile", request.url));
    }
    const profile = await profileRes.json();

    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: profile.sub },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name ?? profile.email,
            googleId: profile.sub,
          },
        });
      }
    }

    await createSession(user.id);

    const res = NextResponse.redirect(new URL(next, request.url));
    res.cookies.delete("oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_unknown", request.url));
  }
}
