import { ApiError, configError } from "./errors.js";

const SAFE_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/;
const SAFE_CHAIN = /^[a-z0-9][a-z0-9_-]{0,49}$/;
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

export const REQUIRED_OPENSEA_SCOPES = Object.freeze([
  "write:drops",
  "write:profile",
]);

function readBoolean(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ApiError(503, "CONFIGURATION_INVALID", `${name} must be true or false.`);
}

function readInteger(name, fallback, min, max) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ApiError(
      503,
      "CONFIGURATION_INVALID",
      `${name} must be an integer between ${min} and ${max}.`,
    );
  }
  return value;
}

function normalizeOrigin(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ApiError(503, "CONFIGURATION_INVALID", `Invalid origin: ${value}.`);
  }
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.origin !== value || (!local && url.protocol !== "https:")) {
    throw new ApiError(
      503,
      "CONFIGURATION_INVALID",
      `Origin must be exact and use HTTPS: ${value}.`,
    );
  }
  return url.origin;
}

export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) throw configError("ALLOWED_ORIGINS");
  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
  if (!values.length || values.includes("*")) {
    throw new ApiError(
      503,
      "CONFIGURATION_INVALID",
      "ALLOWED_ORIGINS must contain exact origins and cannot contain a wildcard.",
    );
  }
  return [...new Set(values.map(normalizeOrigin))];
}

export function isLocalMockEnabled() {
  const requested = readBoolean("OPENSEA_MOCK_MODE", false);
  const deployed = Boolean(process.env.VERCEL_ENV);
  const production = process.env.NODE_ENV === "production";
  return requested && !deployed && !production;
}

export function getCookieConfig() {
  const prefix = process.env.SESSION_COOKIE_PREFIX || "cdm_pixel";
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(prefix)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "Invalid SESSION_COOKIE_PREFIX.");
  }
  const sameSite = process.env.COOKIE_SAME_SITE || "Lax";
  if (!["Lax", "Strict", "None"].includes(sameSite)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "Invalid COOKIE_SAME_SITE.");
  }
  const secure = readBoolean("COOKIE_SECURE", true);
  if (sameSite === "None" && !secure) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "SameSite=None requires Secure cookies.");
  }
  return {
    secure,
    sameSite,
    nonceName: `${prefix}_nonce`,
    walletName: `${prefix}_wallet`,
    openSeaName: `${prefix}_opensea`,
  };
}

export function getAuthConfig() {
  const address = process.env.ALLOWED_WALLET_ADDRESS;
  if (!address) throw configError("ALLOWED_WALLET_ADDRESS");
  if (!EVM_ADDRESS.test(address)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "ALLOWED_WALLET_ADDRESS must be an EVM address.");
  }
  return {
    address,
    chainId: readInteger("AUTH_CHAIN_ID", 1, 1, Number.MAX_SAFE_INTEGER),
    sessionMinutes: readInteger("AUTH_SESSION_MINUTES", 10, 2, 60),
    origin: getAllowedOrigins()[0],
  };
}

export function getOpenSeaConfig({ requireSecrets = true } = {}) {
  const apiKey = process.env.OPENSEA_API_KEY || "";
  const scopedPat = process.env.OPENSEA_SCOPED_PAT || "";
  if (requireSecrets && !apiKey) throw configError("OPENSEA_API_KEY");
  if (requireSecrets && !scopedPat) throw configError("OPENSEA_SCOPED_PAT");

  const baseUrl = process.env.OPENSEA_API_BASE_URL || "https://api.opensea.io";
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new ApiError(503, "CONFIGURATION_INVALID", "Invalid OPENSEA_API_BASE_URL.");
  }
  if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new ApiError(
      503,
      "CONFIGURATION_INVALID",
      "OPENSEA_API_BASE_URL must be an HTTPS origin without a path.",
    );
  }

  const dropSlug = process.env.DROP_SLUG || "";
  const chain = process.env.OPENSEA_CHAIN || "ethereum";
  const contractAddress = process.env.OPENSEA_CONTRACT_ADDRESS || "";
  const shelfTitle = process.env.OPENSEA_SHELF_TITLE || "Pixel Sheet";
  const shelfDescription =
    process.env.OPENSEA_SHELF_DESCRIPTION ||
    "Works created with Pixel Sheet Converter.";
  if (dropSlug && !SAFE_SLUG.test(dropSlug)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "DROP_SLUG is invalid.");
  }
  if (!SAFE_CHAIN.test(chain)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "OPENSEA_CHAIN is invalid.");
  }
  if (contractAddress && !EVM_ADDRESS.test(contractAddress)) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "OPENSEA_CONTRACT_ADDRESS must be an EVM address.");
  }
  if (shelfTitle.length < 1 || shelfTitle.length > 100) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "OPENSEA_SHELF_TITLE must contain 1 to 100 characters.");
  }
  if (shelfDescription.length > 500) {
    throw new ApiError(503, "CONFIGURATION_INVALID", "OPENSEA_SHELF_DESCRIPTION must contain at most 500 characters.");
  }

  return {
    apiKey,
    scopedPat,
    baseUrl: parsed.origin,
    dropSlug,
    chain,
    contractAddress,
    shelfTitle,
    shelfDescription,
    mockMode: isLocalMockEnabled(),
  };
}

export function publicConfiguration() {
  let origins = [];
  let configErrorMessage = null;
  try {
    origins = getAllowedOrigins();
  } catch (error) {
    configErrorMessage = error.code || "CONFIGURATION_INVALID";
  }
  const openSea = getOpenSeaConfig({ requireSecrets: false });
  return {
    service: "cour-de-miracles-opensea-bridge",
    version: "0.1.0",
    allowedOriginsConfigured: origins.length > 0,
    configurationError: configErrorMessage,
    walletConfigured: Boolean(process.env.ALLOWED_WALLET_ADDRESS),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
    openSea: {
      apiKeyConfigured: Boolean(openSea.apiKey),
      scopedPatConfigured: Boolean(openSea.scopedPat),
      dropConfigured: Boolean(openSea.dropSlug),
      contractConfigured: Boolean(openSea.contractAddress),
      chain: openSea.chain,
      shelfTitle: openSea.shelfTitle,
      requiredScopes: REQUIRED_OPENSEA_SCOPES,
      mockMode: openSea.mockMode,
    },
  };
}
