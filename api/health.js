import { apiHandler, sendJson } from "./_lib/http.js";

export default apiHandler(["GET"], async (_request, response) => {
  sendJson(response, 200, {
    ok: true,
    service: "cour-de-miracles-opensea-bridge",
    version: "0.1.0",
  });
});
