import { getAuthConfig, getCookieConfig } from "../_lib/config.js";
import { ApiError } from "../_lib/errors.js";
import { apiHandler, jsonBody, sendJson } from "../_lib/http.js";
import { createOpenSeaClient } from "../_lib/opensea.js";
import {
  clearCookie,
  encryptedCookie,
  randomToken,
  requireFreshCookie,
  safeEqual,
  setCookies,
} from "../_lib/session.js";
import {
  assertAllowedWallet,
  canonicalAddress,
  verifyWalletChallenge,
} from "../_lib/wallet-auth.js";
import { objectValue, signatureValue, stringValue } from "../_lib/validation.js";

const EXPIRY_SAFETY_MS = 30_000;

export default apiHandler(["POST"], async (request, response) => {
  const body = objectValue(jsonBody(request));
  const config = getAuthConfig();
  const cookies = getCookieConfig();
  const challenge = requireFreshCookie(request, cookies.nonceName, "challenge");
  const address = assertAllowedWallet(body.address, config.address);
  const message = stringValue(body.message, "message", { min: 1, max: 4096 });
  const signature = signatureValue(body.signature);

  if (canonicalAddress(challenge.address) !== address || !safeEqual(challenge.message, message)) {
    throw new ApiError(401, "CHALLENGE_MISMATCH", "The signed wallet challenge does not match the active session.");
  }
  verifyWalletChallenge(message, signature, address);

  const token = await createOpenSeaClient().exchangeScopedPat();
  const expiresAt = token.expiresAt - EXPIRY_SAFETY_MS;
  if (expiresAt <= Date.now()) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned an unusable wallet token expiry.");
  }
  const csrfToken = randomToken(24);
  const maxAge = Math.floor((expiresAt - Date.now()) / 1000);
  setCookies(response, [
    encryptedCookie(
      cookies.openSeaName,
      {
        stage: "opensea_ready",
        address,
        accessToken: token.accessToken,
        scopes: token.scopes,
        csrfToken,
        expiresAt,
      },
      maxAge,
    ),
    clearCookie(cookies.nonceName),
    clearCookie(cookies.walletName),
  ]);
  sendJson(response, 200, {
    authenticated: true,
    address,
    csrfToken,
    expiresAt,
    scopes: token.scopes,
  });
});
