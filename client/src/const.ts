export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the URL the client should send the user to in order to sign in.
 *
 * - If both `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` are configured, we build
 *   a Manus-style OAuth portal URL.
 * - Otherwise (typical for local development) we fall back to the server's
 *   dev-login endpoint, which signs a session cookie without any external
 *   round-trip. That endpoint is only registered in non-production builds.
 */
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    return "/api/dev-login";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
