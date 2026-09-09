import { requireOpenSeaSession } from "../_lib/access.js";
import { getCookieConfig } from "../_lib/config.js";
import { apiHandler, sendJson } from "../_lib/http.js";
import { clearCookie, setCookies } from "../_lib/session.js";

export default apiHandler(["POST"], async (request, response) => {
  requireOpenSeaSession(request, { csrf: true });
  const cookies = getCookieConfig();
  setCookies(response, [
    clearCookie(cookies.nonceName),
    clearCookie(cookies.walletName),
    clearCookie(cookies.openSeaName),
  ]);
  sendJson(response, 200, { authenticated: false });
});
