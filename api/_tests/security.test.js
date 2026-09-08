import test from "node:test";
import assert from "node:assert/strict";
import { Wallet } from "ethers";
import challengeHandler from "../auth/challenge.js";
import sessionHandler from "../auth/session.js";
import verifyHandler from "../auth/verify.js";
import { getAllowedOrigins } from "../_lib/config.js";
import { ApiError } from "../_lib/errors.js";
import { __sessionTest } from "../_lib/session.js";

class MockResponse {
  constructor() {
    this.headers = new Map();
    this.statusCode = 200;
    this.body = undefined;
  }

  setHeader(name, value) {
    this.headers.set(name.toLowerCase(), value);
  }

  getHeader(name) {
    return this.headers.get(name.toLowerCase());
  }

  status(value) {
    this.statusCode = value;
    return this;
  }

  json(value) {
    this.body = value;
    return this;
  }

  end() {
    return this;
  }
}

function cookiePair(setCookie) {
  return setCookie.split(";", 1)[0];
}

function baseEnv(wallet) {
  process.env.ALLOWED_ORIGINS = "https://courdemiracles.net";
  process.env.ALLOWED_WALLET_ADDRESS = wallet;
  process.env.SESSION_SECRET = Buffer.alloc(32, 7).toString("base64");
  process.env.COOKIE_SECURE = "true";
  process.env.COOKIE_SAME_SITE = "Lax";
  process.env.OPENSEA_MOCK_MODE = "true";
  delete process.env.VERCEL_ENV;
  delete process.env.NODE_ENV;
}

test("CORS configuration rejects wildcards", () => {
  process.env.ALLOWED_ORIGINS = "*";
  assert.throws(
    () => getAllowedOrigins(),
    (error) => error instanceof ApiError && error.code === "CONFIGURATION_INVALID",
  );
});

test("AES-GCM cookies reject tampering", () => {
  process.env.SESSION_SECRET = Buffer.alloc(32, 3).toString("base64");
  const encrypted = __sessionTest.encrypt("cookie", { stage: "test", expiresAt: Date.now() + 1000 });
  assert.equal(__sessionTest.decrypt("cookie", encrypted).stage, "test");
  const parts = encrypted.split(".");
  parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;
  const tampered = parts.join(".");
  assert.equal(__sessionTest.decrypt("cookie", tampered), null);
  assert.equal(__sessionTest.decrypt("different-cookie", encrypted), null);
});

test("challenge and signature verification establish only an encrypted HttpOnly session", async () => {
  const wallet = Wallet.createRandom();
  baseEnv(wallet.address);
  const origin = "https://courdemiracles.net";

  const challengeResponse = new MockResponse();
  await challengeHandler(
    { method: "POST", headers: { origin }, body: { address: wallet.address } },
    challengeResponse,
  );
  assert.equal(challengeResponse.statusCode, 200);
  const challengeCookies = challengeResponse.getHeader("Set-Cookie");
  assert.equal(challengeCookies.length, 1);
  assert.match(challengeCookies[0], /HttpOnly/);
  assert.match(challengeCookies[0], /Secure/);
  const signature = await wallet.signMessage(challengeResponse.body.message);

  const verifyResponse = new MockResponse();
  await verifyHandler(
    {
      method: "POST",
      headers: { origin, cookie: cookiePair(challengeCookies[0]) },
      body: {
        address: wallet.address,
        message: challengeResponse.body.message,
        signature,
      },
    },
    verifyResponse,
  );
  assert.equal(verifyResponse.statusCode, 200);
  assert.equal(verifyResponse.body.authenticated, true);
  assert.equal(typeof verifyResponse.body.csrfToken, "string");
  assert.equal("accessToken" in verifyResponse.body, false);
  assert.doesNotMatch(JSON.stringify(verifyResponse.body), /local\.mock\.wallet-token/);

  const sessionCookie = verifyResponse
    .getHeader("Set-Cookie")
    .find((value) => value.startsWith("cdm_pixel_opensea="));
  assert.ok(sessionCookie);
  assert.match(sessionCookie, /HttpOnly/);

  const sessionResponse = new MockResponse();
  await sessionHandler(
    { method: "GET", headers: { origin, cookie: cookiePair(sessionCookie) } },
    sessionResponse,
  );
  assert.equal(sessionResponse.statusCode, 200);
  assert.equal(sessionResponse.body.authenticated, true);
  assert.equal("accessToken" in sessionResponse.body, false);
});
