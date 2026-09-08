import { ApiError, configError } from "./errors.js";
import { getOpenSeaConfig, REQUIRED_OPENSEA_SCOPES } from "./config.js";
import { assertTransaction } from "./validation.js";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_WALLET_SESSION_MS = 12 * 60 * 60 * 1000;
const FORWARDED_STATUSES = new Set([400, 401, 403, 404, 409, 422, 429]);
const MOCK_ADDRESS = "0x0000000000000000000000000000000000000001";
let mockShelves = [];

function upstreamSchema(message) {
  throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", message);
}

function requiredSecret(value, name) {
  if (!value) throw configError(name);
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function decodeJwtPayload(token) {
  const parts = typeof token === "string" ? token.split(".") : [];
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
  } catch {
    return null;
  }
}

function normalizeScopes(value) {
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value) && value.every((scope) => typeof scope === "string")) return value;
  return null;
}

export function assertRequiredScopes(scopes) {
  const normalized = normalizeScopes(scopes);
  if (!normalized) upstreamSchema("OpenSea did not return a verifiable token scope set.");
  const actual = [...new Set(normalized)].sort();
  const expected = [...REQUIRED_OPENSEA_SCOPES].sort();
  if (actual.length !== expected.length || actual.some((scope, index) => scope !== expected[index])) {
    throw new ApiError(
      503,
      "OPENSEA_SCOPE_MISMATCH",
      `The configured OpenSea PAT must contain exactly: ${expected.join(", ")}.`,
    );
  }
  return expected;
}

function parseTokenExchange(value, now = Date.now()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    upstreamSchema("OpenSea returned an invalid token exchange response.");
  }
  if (typeof value.accessToken !== "string" || value.accessToken.length < 10 || value.accessToken.length > 8192) {
    upstreamSchema("OpenSea returned an invalid wallet access token.");
  }
  if (typeof value.tokenType !== "string" || value.tokenType.toLowerCase() !== "bearer") {
    upstreamSchema("OpenSea returned an unsupported token type.");
  }

  const jwt = decodeJwtPayload(value.accessToken);
  const reportedSets = [];
  if (value.tokenScopes !== undefined) reportedSets.push(normalizeScopes(value.tokenScopes));
  if (value.scope !== undefined) reportedSets.push(normalizeScopes(value.scope));
  if (!reportedSets.length && jwt) {
    reportedSets.push(normalizeScopes(jwt.scope ?? jwt.scopes));
  }
  if (!reportedSets.length || reportedSets.some((scopes) => scopes === null)) {
    upstreamSchema("OpenSea did not return a verifiable token scope set.");
  }
  const scopes = assertRequiredScopes(reportedSets[0]);
  for (const set of reportedSets.slice(1)) assertRequiredScopes(set);

  const expiries = [];
  if (Number.isInteger(value.expiresIn) && value.expiresIn > 0) {
    expiries.push(now + value.expiresIn * 1000);
  }
  if (Number.isInteger(jwt?.exp) && jwt.exp > 0) expiries.push(jwt.exp * 1000);
  if (!expiries.length) upstreamSchema("OpenSea did not return a verifiable wallet token expiry.");
  const expiresAt = Math.min(...expiries, now + MAX_WALLET_SESSION_MS);
  if (expiresAt <= now + 60_000) upstreamSchema("OpenSea returned a wallet token that expires too soon.");
  return { accessToken: value.accessToken, scopes, expiresAt };
}

function assertUploadContexts(value, expectedCount) {
  if (!Array.isArray(value) || value.length !== expectedCount) {
    upstreamSchema("OpenSea returned an unexpected number of upload contexts.");
  }
  for (const context of value) {
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      upstreamSchema("OpenSea returned an invalid upload context.");
    }
    let url;
    try {
      url = new URL(context.url);
    } catch {
      upstreamSchema("OpenSea returned an invalid upload URL.");
    }
    if (url.protocol !== "https:" || !["POST", "PUT"].includes(context.method)) {
      upstreamSchema("OpenSea returned an unsafe upload context.");
    }
    if (typeof context.token !== "string" || !context.token.length || context.token.length > 8192) {
      upstreamSchema("OpenSea returned an invalid media token.");
    }
    if (!context.fields || typeof context.fields !== "object" || Array.isArray(context.fields)) {
      upstreamSchema("OpenSea returned invalid upload fields.");
    }
    if (Object.values(context.fields).some((field) => typeof field !== "string")) {
      upstreamSchema("OpenSea returned invalid upload field values.");
    }
  }
  return value;
}

function assertShelf(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    upstreamSchema("OpenSea returned an invalid shelf.");
  }
  if (typeof value.id !== "string" || !value.id || typeof value.title !== "string" || !Array.isArray(value.items)) {
    upstreamSchema("OpenSea returned an incomplete shelf.");
  }
  for (const item of value.items) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.chain !== "string" ||
      typeof item.contract_address !== "string" ||
      typeof item.token_id !== "string"
    ) {
      upstreamSchema("OpenSea returned an invalid shelf item.");
    }
  }
  return value;
}

function assertShelfList(value) {
  if (!Array.isArray(value)) upstreamSchema("OpenSea returned an invalid shelf list.");
  return value.map(assertShelf);
}

function mapUpstreamStatus(status) {
  return FORWARDED_STATUSES.has(status) ? status : 502;
}

function upstreamError(status, retryAfter) {
  const details = { upstreamStatus: status };
  if (retryAfter && /^\d{1,6}$/.test(retryAfter)) details.retryAfter = Number(retryAfter);
  return new ApiError(
    mapUpstreamStatus(status),
    status === 429 ? "OPENSEA_RATE_LIMITED" : "OPENSEA_REQUEST_FAILED",
    status === 429 ? "OpenSea rate limit reached. Retry later." : "OpenSea rejected the request.",
    details,
  );
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    upstreamSchema("OpenSea returned a non-JSON response.");
  }
}

function mockClient(config) {
  return {
    async exchangeScopedPat() {
      requiredSecret(config.scopedPat || "local-mock-pat", "OPENSEA_SCOPED_PAT");
      return {
        accessToken: "local.mock.wallet-token",
        scopes: [...REQUIRED_OPENSEA_SCOPES],
        expiresAt: Date.now() + 60 * 60 * 1000,
      };
    },
    async getMediaUploadContext({ filenames }) {
      return filenames.map((filename, index) => ({
        url: `https://uploads.example.invalid/pixel-sheet/${index}`,
        method: "POST",
        fields: { key: `local/${filename}`, "Content-Type": "image/png" },
        token: `local-media-token-${index}`,
      }));
    },
    async prepareSelfMintItem() {
      return {
        to: config.contractAddress || MOCK_ADDRESS,
        data: "0x",
        value: "0x0",
        chain: config.chain,
      };
    },
    async getProfileShelves() {
      return clone(mockShelves);
    },
    async createProfileShelf(body) {
      const shelf = {
        id: `mock-shelf-${mockShelves.length + 1}`,
        account_address: MOCK_ADDRESS,
        display_order: mockShelves.length,
        shelf_item_metadata: {},
        ...clone(body),
      };
      mockShelves.push(shelf);
      return clone(shelf);
    },
    async updateProfileShelf(id, body) {
      const index = mockShelves.findIndex((shelf) => shelf.id === id);
      if (index < 0) throw new ApiError(404, "OPENSEA_REQUEST_FAILED", "OpenSea rejected the request.");
      const next = { ...mockShelves[index], ...clone(body) };
      if (Array.isArray(body.items)) next.items = body.items.map((entry) => clone(entry.item));
      mockShelves[index] = next;
      return clone(next);
    },
  };
}

export function createOpenSeaClient({ fetchImpl = globalThis.fetch, config = getOpenSeaConfig({ requireSecrets: false }) } = {}) {
  if (config.mockMode) return mockClient(config);
  if (typeof fetchImpl !== "function") throw new ApiError(503, "FETCH_UNAVAILABLE", "Server fetch is unavailable.");

  async function request(path, { method = "GET", body, accessToken, apiKeyRequired = true } = {}) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (apiKeyRequired) headers["X-API-KEY"] = requiredSecret(config.apiKey, "OPENSEA_API_KEY");
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    let response;
    try {
      response = await fetchImpl(`${config.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        throw new ApiError(504, "OPENSEA_TIMEOUT", "OpenSea did not respond in time.");
      }
      throw new ApiError(502, "OPENSEA_UNAVAILABLE", "OpenSea could not be reached.");
    }
    if (!response.ok) throw upstreamError(response.status, response.headers?.get?.("retry-after"));
    return parseJsonResponse(response);
  }

  return {
    async exchangeScopedPat() {
      const subjectToken = requiredSecret(config.scopedPat, "OPENSEA_SCOPED_PAT");
      if (subjectToken.length < 10 || subjectToken.length > 8192) {
        throw new ApiError(503, "CONFIGURATION_INVALID", "OPENSEA_SCOPED_PAT has an invalid length.");
      }
      const response = await request("/api/v2/auth/tokens/exchange", {
        method: "POST",
        apiKeyRequired: false,
        body: { subjectToken, subjectTokenType: "ACCESS_TOKEN" },
      });
      return parseTokenExchange(response);
    },

    async getMediaUploadContext({ slug, filenames, accessToken }) {
      const response = await request(`/api/v2/drops/${encodeURIComponent(slug)}/items/media`, {
        method: "POST",
        accessToken,
        body: { filenames },
      });
      return assertUploadContexts(response, filenames.length);
    },

    async prepareSelfMintItem({ slug, item, accessToken }) {
      const response = await request(`/api/v2/drops/${encodeURIComponent(slug)}/items`, {
        method: "POST",
        accessToken,
        body: item,
      });
      return assertTransaction(response);
    },

    async getProfileShelves(address) {
      const query = new URLSearchParams({ address });
      return assertShelfList(await request(`/api/v2/profile/shelves?${query}`));
    },

    async createProfileShelf(body, accessToken) {
      return assertShelf(await request("/api/v2/profile/shelves", {
        method: "POST",
        accessToken,
        body,
      }));
    },

    async updateProfileShelf(id, body, accessToken) {
      if (typeof id !== "string" || !id || id.length > 200) upstreamSchema("OpenSea returned an invalid shelf ID.");
      return assertShelf(await request(`/api/v2/profile/shelves/${encodeURIComponent(id)}`, {
        method: "PATCH",
        accessToken,
        body,
      }));
    },
  };
}

export const __openSeaTest = Object.freeze({
  assertUploadContexts,
  decodeJwtPayload,
  parseTokenExchange,
  resetMockShelves() {
    mockShelves = [];
  },
});
