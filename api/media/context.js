import { requireOpenSeaSession } from "../_lib/access.js";
import { getOpenSeaConfig } from "../_lib/config.js";
import { configError } from "../_lib/errors.js";
import { apiHandler, jsonBody, sendJson } from "../_lib/http.js";
import { createOpenSeaClient } from "../_lib/opensea.js";
import { mediaContextInput } from "../_lib/validation.js";

export default apiHandler(["POST"], async (request, response) => {
  const session = requireOpenSeaSession(request, { csrf: true });
  const config = getOpenSeaConfig({ requireSecrets: false });
  if (!config.dropSlug) throw configError("DROP_SLUG");
  if (!config.contractAddress) throw configError("OPENSEA_CONTRACT_ADDRESS");
  const { filenames } = mediaContextInput(jsonBody(request), config.dropSlug);
  const contexts = await createOpenSeaClient({ config }).getMediaUploadContext({
    slug: config.dropSlug,
    filenames,
    accessToken: session.accessToken,
  });
  sendJson(response, 200, {
    contexts,
    sensitive: true,
    expiresQuickly: true,
    next: "Upload each file directly to its context URL, then use its token to prepare the mint.",
  });
});
