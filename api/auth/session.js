import { getAuthConfig, getCookieConfig } from "../_lib/config.js";
import { apiHandler, sendJson } from "../_lib/http.js";
import { assertRequiredScopes } from "../_lib/opensea.js";
import { isExpired, readEncryptedCookie } from "../_lib/session.js";
import { assertAllowedWallet } from "../_lib/wallet-auth.js";

export default apiHandler(["GET"], async (request, response) => {
  const cookies = getCookieConfig();
  const session = readEncryptedCookie(request, cookies.openSeaName);
  if (!session || session.stage !== "opensea_ready" || isExpired(session)) {
    sendJson(response, 200, { authenticated: false });
    return;
  }
  const address = assertAllowedWallet(session.address, getAuthConfig().address);
  assertRequiredScopes(session.scopes);
  sendJson(response, 200, {
    authenticated: true,
    address,
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
    scopes: session.scopes,
  });
});
