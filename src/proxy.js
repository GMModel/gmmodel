import { NextResponse } from "next/server";

const COOKIE_NAME = "locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request) {
  if (request.cookies.has(COOKIE_NAME)) {
    return NextResponse.next();
  }

  // Always default to Vietnamese regardless of visitor location.
  // Visitors can switch to English or Español manually via the language switcher.
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, "vi", {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
