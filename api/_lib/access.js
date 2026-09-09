import { ApiError } from "./errors.js";
import { getAuthConfig, getCookieConfig } from "./config.js";
import { assertAllowedWallet } from "./wallet-auth.js";
import { assertRequiredScopes } from "./opensea.js";
import { requireCsrf, requireFreshCookie } from "./session.js";

export function requireOpenSeaSession(request, { csrf = false } = {}) {
  const names = getCookieConfig();
  const session = requireFreshCookie(request, names.openSeaName, "opensea_ready");
  if (typeof session.accessToken !== "string" || session.accessToken.length < 10) {
    throw new ApiError(401, "SESSION_INVALID", "The OpenSea session is invalid.");
  }
  assertAllowedWallet(session.address, getAuthConfig().address);
  assertRequiredScopes(session.scopes);
  if (csrf) requireCsrf(request, session);
  return session;
}
