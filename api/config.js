import { publicConfiguration } from "./_lib/config.js";
import { apiHandler, sendJson } from "./_lib/http.js";

export default apiHandler(["GET"], async (_request, response) => {
  sendJson(response, 200, publicConfiguration());
});
