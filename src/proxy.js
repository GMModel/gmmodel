import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

const COOKIE_NAME = "locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request) {
  if (request.cookies.has(COOKIE_NAME)) {
    return NextResponse.next();
  }

  const { country } = geolocation(request);
  // No geo data (e.g. local dev, or self-hosted without Vercel) defaults to Vietnamese.
  // Only switch to English when we can confirm the visitor is not in Vietnam.
  const locale = country && country !== "VN" ? "en" : "vi";

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
