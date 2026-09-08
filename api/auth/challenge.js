import { getAuthConfig, getCookieConfig } from "../_lib/config.js";
import { apiHandler, jsonBody, sendJson } from "../_lib/http.js";
import { encryptedCookie, randomToken, setCookies } from "../_lib/session.js";
import { assertAllowedWallet, buildWalletChallenge } from "../_lib/wallet-auth.js";
import { objectValue } from "../_lib/validation.js";

export default apiHandler(["POST"], async (request, response) => {
  const body = objectValue(jsonBody(request));
  const config = getAuthConfig();
  const cookies = getCookieConfig();
  const address = assertAllowedWallet(body.address, config.address);
  const headerOrigin = Array.isArray(request.headers?.origin)
    ? request.headers.origin[0]
    : request.headers?.origin;
  const origin = headerOrigin || config.origin;
  const now = Date.now();
  const expiresAt = now + config.sessionMinutes * 60_000;
  const message = buildWalletChallenge({
    address,
    origin,
    chainId: config.chainId,
    nonce: randomToken(18),
    issuedAt: new Date(now).toISOString(),
    expirationTime: new Date(expiresAt).toISOString(),
  });

  setCookies(response, [
    encryptedCookie(
      cookies.nonceName,
      { stage: "challenge", address, message, expiresAt },
      config.sessionMinutes * 60,
    ),
  ]);
  sendJson(response, 200, { address, message, expiresAt });
});
