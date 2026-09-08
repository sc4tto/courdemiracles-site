import test from "node:test";
import assert from "node:assert/strict";
import challengeHandler from "../auth/challenge.js";
import configHandler from "../config.js";
import mediaHandler from "../media/context.js";
import mintHandler from "../mint/prepare.js";
import shelfSyncHandler from "../shelves/sync.js";
import { getCookieConfig } from "../_lib/config.js";
import { encryptedCookie } from "../_lib/session.js";

const ORIGIN = "https://courdemiracles.net";
const WALLET = "0x0000000000000000000000000000000000000001";
const CSRF = "csrf-for-route-tests";

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

function configure() {
  process.env.ALLOWED_ORIGINS = ORIGIN;
  process.env.ALLOWED_WALLET_ADDRESS = WALLET;
  process.env.SESSION_SECRET = Buffer.alloc(32, 9).toString("base64");
  process.env.COOKIE_SECURE = "true";
  process.env.COOKIE_SAME_SITE = "Lax";
  process.env.OPENSEA_MOCK_MODE = "true";
  process.env.DROP_SLUG = "pixel-sheet";
  process.env.OPENSEA_CHAIN = "ethereum";
  process.env.OPENSEA_CONTRACT_ADDRESS = WALLET;
  delete process.env.VERCEL_ENV;
  delete process.env.NODE_ENV;
}

function sessionCookie() {
  const name = getCookieConfig().openSeaName;
  const value = encryptedCookie(
    name,
    {
      stage: "opensea_ready",
      address: WALLET,
      accessToken: "local.mock.wallet-token",
      scopes: ["write:drops", "write:profile"],
      csrfToken: CSRF,
      expiresAt: Date.now() + 60_000,
    },
    60,
  );
  return value.split(";", 1)[0];
}

function request(method, body, { origin = ORIGIN, csrf = CSRF } = {}) {
  const headers = { origin, cookie: sessionCookie() };
  if (csrf !== null) headers["x-csrf-token"] = csrf;
  return { method, headers, body };
}

test("a non-allowlisted Origin is rejected before a challenge cookie is created", async () => {
  configure();
  const response = new MockResponse();
  await challengeHandler(
    { method: "POST", headers: { origin: "https://attacker.example" }, body: { address: WALLET } },
    response,
  );
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error.code, "ORIGIN_FORBIDDEN");
  assert.equal(response.getHeader("Set-Cookie"), undefined);
});

test("post-authentication routes reject missing and wrong CSRF tokens", async () => {
  configure();
  for (const csrf of [null, "wrong-token"]) {
    const response = new MockResponse();
    await mediaHandler(request("POST", { filenames: ["work.png"] }, { csrf }), response);
    assert.equal(response.statusCode, 403);
    assert.equal(response.body.error.code, "CSRF_INVALID");
  }
});

test("media and mint routes expose the wrappers consumed by the browser client", async () => {
  configure();
  const mediaResponse = new MockResponse();
  await mediaHandler(request("POST", { filenames: ["work.png"] }), mediaResponse);
  assert.equal(mediaResponse.statusCode, 200);
  assert.equal(Array.isArray(mediaResponse.body.contexts), true);
  assert.equal(mediaResponse.body.contexts.length, 1);
  assert.equal(mediaResponse.body.sensitive, true);
  assert.equal(mediaResponse.body.contexts[0].method, "POST");

  const mintResponse = new MockResponse();
  await mintHandler(
    request("POST", {
      mediaToken: mediaResponse.body.contexts[0].token,
      name: "Pixel work",
      description: "Route test",
      supply: "1",
      traits: [{ traitType: "Palette", value: "mono" }],
    }),
    mintResponse,
  );
  assert.equal(mintResponse.statusCode, 200);
  assert.deepEqual(Object.keys(mintResponse.body.transaction).sort(), ["chain", "data", "to", "value"]);
  assert.equal(mintResponse.body.requiresWalletSignature, true);
  assert.equal(mintResponse.body.broadcastByClient, true);
});

test("public configuration exposes readiness without exposing configured values", async () => {
  configure();
  process.env.OPENSEA_API_KEY = "private-api-key";
  process.env.OPENSEA_SCOPED_PAT = "private-scoped-pat";
  const response = new MockResponse();
  await configHandler({ method: "GET", headers: { origin: ORIGIN } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.openSea.contractConfigured, true);
  assert.equal(response.body.openSea.dropConfigured, true);
  assert.equal(response.body.openSea.apiKeyConfigured, true);
  assert.equal(response.body.openSea.scopedPatConfigured, true);
  assert.doesNotMatch(JSON.stringify(response.body), /private-api-key|private-scoped-pat/i);
});

test("media and mint invariants reject non-PNG batches and supply other than one", async () => {
  configure();
  const mediaResponse = new MockResponse();
  await mediaHandler(request("POST", { filenames: ["work.png", "second.png"] }), mediaResponse);
  assert.equal(mediaResponse.statusCode, 400);
  assert.equal(mediaResponse.body.error.code, "INVALID_REQUEST");

  const wrongExtensionResponse = new MockResponse();
  await mediaHandler(request("POST", { filenames: ["work.jpg"] }), wrongExtensionResponse);
  assert.equal(wrongExtensionResponse.statusCode, 400);
  assert.equal(wrongExtensionResponse.body.error.code, "INVALID_REQUEST");

  const mintResponse = new MockResponse();
  await mintHandler(
    request("POST", {
      mediaToken: "media-token",
      name: "Pixel work",
      supply: "2",
    }),
    mintResponse,
  );
  assert.equal(mintResponse.statusCode, 400);
  assert.equal(mintResponse.body.error.code, "INVALID_REQUEST");
});

test("shelf sync fails closed until the managed contract is configured", async () => {
  configure();
  process.env.OPENSEA_CONTRACT_ADDRESS = "";
  const response = new MockResponse();
  await shelfSyncHandler(
    request("POST", {
      item: { chain: "ethereum", contractAddress: WALLET, tokenId: "1" },
    }),
    response,
  );
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, "CONFIGURATION_MISSING");
  assert.match(response.body.error.message, /OPENSEA_CONTRACT_ADDRESS/);
});
