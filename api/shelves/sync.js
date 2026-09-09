import { requireOpenSeaSession } from "../_lib/access.js";
import { getOpenSeaConfig } from "../_lib/config.js";
import { configError } from "../_lib/errors.js";
import { apiHandler, jsonBody, sendJson } from "../_lib/http.js";
import { createOpenSeaClient } from "../_lib/opensea.js";
import { syncPixelSheetShelf } from "../_lib/shelf-sync.js";
import { shelfSyncInput } from "../_lib/validation.js";

export default apiHandler(["POST"], async (request, response) => {
  const session = requireOpenSeaSession(request, { csrf: true });
  const config = getOpenSeaConfig({ requireSecrets: false });
  if (!config.contractAddress) throw configError("OPENSEA_CONTRACT_ADDRESS");
  const input = shelfSyncInput(jsonBody(request), config);
  const result = await syncPixelSheetShelf({
    client: createOpenSeaClient({ config }),
    config,
    address: session.address,
    accessToken: session.accessToken,
    ...input,
  });
  sendJson(response, 200, result);
});
