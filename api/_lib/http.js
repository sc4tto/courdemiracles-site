import { ApiError } from "./errors.js";
import { getAllowedOrigins } from "./config.js";

function requestOrigin(request) {
  const header = request.headers?.origin;
  return Array.isArray(header) ? header[0] : header;
}

function setCommonHeaders(response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Cache-Control", "no-store");
}

export function applyCors(request, response) {
  const origin = requestOrigin(request);
  if (!origin) return;
  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin)) {
    throw new ApiError(403, "ORIGIN_FORBIDDEN", "This origin is not allowed.");
  }
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
  response.setHeader("Access-Control-Max-Age", "600");
  response.setHeader("Vary", "Origin");
}

export function jsonBody(request, { maxBytes = 32_768 } = {}) {
  let body = request.body;
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "string") {
    if (Buffer.byteLength(body) > maxBytes) {
      throw new ApiError(413, "REQUEST_TOO_LARGE", "Request body is too large.");
    }
    try {
      body = JSON.parse(body);
    } catch {
      throw new ApiError(400, "INVALID_JSON", "Request body must contain valid JSON.");
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "INVALID_REQUEST", "Request body must be a JSON object.");
  }
  if (Buffer.byteLength(JSON.stringify(body)) > maxBytes) {
    throw new ApiError(413, "REQUEST_TOO_LARGE", "Request body is too large.");
  }
  return body;
}

export function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function sendError(response, error) {
  const status = error instanceof ApiError ? error.status : 500;
  const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
  const message = error instanceof ApiError ? error.message : "Unexpected server error.";
  const body = { error: { code, message } };
  if (error instanceof ApiError && error.details !== undefined) body.error.details = error.details;
  sendJson(response, status, body);
}

export function apiHandler(methods, handler) {
  const allowed = new Set(methods);
  return async function wrapped(request, response) {
    setCommonHeaders(response);
    try {
      applyCors(request, response);
      if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
      }
      if (!allowed.has(request.method)) {
        response.setHeader("Allow", [...allowed, "OPTIONS"].join(", "));
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "HTTP method not allowed.");
      }
      await handler(request, response);
    } catch (error) {
      sendError(response, error);
    }
  };
}

export const __httpTest = Object.freeze({ requestOrigin });
