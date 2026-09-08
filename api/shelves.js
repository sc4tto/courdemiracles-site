import { getAuthConfig, getOpenSeaConfig } from "./_lib/config.js";
import { apiHandler, sendJson } from "./_lib/http.js";
import { createOpenSeaClient } from "./_lib/opensea.js";
import { canonicalAddress } from "./_lib/wallet-auth.js";

export default apiHandler(["GET"], async (_request, response) => {
  const config = getOpenSeaConfig({ requireSecrets: false });
  const address = canonicalAddress(getAuthConfig().address);
  const shelves = await createOpenSeaClient({ config }).getProfileShelves(address);
  const matching = shelves.filter((shelf) => shelf.title === config.shelfTitle);
  response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  sendJson(response, 200, { shelf: matching[0] || null, ambiguous: matching.length > 1 });
});
