// Redirect URI sent to Google. It must match, character for character, one of the
// "Authorized redirect URIs" of the OAuth client in Google Cloud Console.
// In production we use NEXT_PUBLIC_SITE_URL (request.url can show an internal host behind a proxy);
// in development we use the address the browser actually used, so any local port works once registered.
export function getGoogleRedirectUri(request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const base = process.env.NODE_ENV === "production" && site ? site : new URL(request.url).origin;
  return new URL("/api/auth/google/callback", base).toString();
}
