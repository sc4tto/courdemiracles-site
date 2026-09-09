import { requireOpenSeaSession } from "../_lib/access.js";
import { getOpenSeaConfig } from "../_lib/config.js";
import { configError } from "../_lib/errors.js";
import { apiHandler, jsonBody, sendJson } from "../_lib/http.js";
import { createOpenSeaClient } from "../_lib/opensea.js";
import { selfMintInput } from "../_lib/validation.js";

export default apiHandler(["POST"], async (request, response) => {
  const session = requireOpenSeaSession(request, { csrf: true });
  const config = getOpenSeaConfig({ requireSecrets: false });
  if (!config.dropSlug) throw configError("DROP_SLUG");
  if (!config.contractAddress) throw configError("OPENSEA_CONTRACT_ADDRESS");
  const { item } = selfMintInput(jsonBody(request), config.dropSlug);
  const transaction = await createOpenSeaClient({ config }).prepareSelfMintItem({
    slug: config.dropSlug,
    item,
    accessToken: session.accessToken,
  });
  sendJson(response, 200, {
    transaction,
    requiresWalletSignature: true,
    broadcastByClient: true,
  });
});
