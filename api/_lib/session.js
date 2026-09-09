import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { ApiError, configError } from "./errors.js";
import { getCookieConfig } from "./config.js";

const COOKIE_VALUE_LIMIT = 3800;

function sessionKey() {
  const raw = process.env.SESSION_SECRET;
  if (!raw) throw configError("SESSION_SECRET");
  let key;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new ApiError(503, "CONFIGURATION_INVALID", "SESSION_SECRET is not valid base64.");
  }
  if (key.length !== 32 || key.toString("base64").replace(/=+$/, "") !== raw.replace(/=+$/, "")) {
    throw new ApiError(
      503,
      "CONFIGURATION_INVALID",
      "SESSION_SECRET must be exactly 32 random bytes encoded as base64.",
    );
  }
  return key;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function encrypt(name, payload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(), iv);
  cipher.setAAD(Buffer.from(name, "utf8"));
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${base64url(iv)}.${base64url(ciphertext)}.${base64url(tag)}`;
}

function decrypt(name, value) {
  if (typeof value !== "string") return null;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  try {
    const iv = Buffer.from(parts[1], "base64url");
    const ciphertext = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(), iv);
    decipher.setAAD(Buffer.from(name, "utf8"));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const payload = JSON.parse(plaintext.toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

export function parseCookies(request) {
  const header = request.headers?.cookie;
  const source = Array.isArray(header) ? header.join("; ") : header || "";
  const result = {};
  for (const part of source.split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name && !(name in result)) result[name] = value;
  }
  return result;
}

export function readEncryptedCookie(request, name) {
  return decrypt(name, parseCookies(request)[name]);
}

function cookieAttributes(maxAge) {
  const config = getCookieConfig();
  return [
    "Path=/api",
    "HttpOnly",
    config.secure ? "Secure" : null,
    `SameSite=${config.sameSite}`,
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
  ].filter(Boolean);
}

export function encryptedCookie(name, payload, maxAge) {
  const value = encrypt(name, payload);
  if (value.length > COOKIE_VALUE_LIMIT) {
    throw new ApiError(
      503,
      "SESSION_TOO_LARGE",
      "The encrypted session is too large for a secure browser cookie.",
    );
  }
  return [`${name}=${value}`, ...cookieAttributes(maxAge)].join("; ");
}

export function clearCookie(name) {
  return [`${name}=`, ...cookieAttributes(0), "Expires=Thu, 01 Jan 1970 00:00:00 GMT"].join("; ");
}

export function setCookies(response, values) {
  const current = response.getHeader?.("Set-Cookie");
  const existing = current === undefined ? [] : Array.isArray(current) ? current : [current];
  response.setHeader("Set-Cookie", [...existing, ...values]);
}

export function isExpired(payload, now = Date.now()) {
  return !Number.isFinite(payload?.expiresAt) || payload.expiresAt <= now;
}

export function safeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireCsrf(request, session) {
  const header = request.headers?.["x-csrf-token"];
  const value = Array.isArray(header) ? header[0] : header;
  if (!safeEqual(value, session?.csrfToken)) {
    throw new ApiError(403, "CSRF_INVALID", "The CSRF token is missing or invalid.");
  }
}

export function requireFreshCookie(request, name, stage) {
  const value = readEncryptedCookie(request, name);
  if (!value || value.stage !== stage || isExpired(value)) {
    throw new ApiError(401, "SESSION_REQUIRED", "A fresh wallet session is required.");
  }
  return value;
}

export const __sessionTest = Object.freeze({ encrypt, decrypt });
