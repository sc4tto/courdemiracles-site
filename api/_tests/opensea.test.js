import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../_lib/errors.js";
import {
  __openSeaTest,
  assertRequiredScopes,
  createOpenSeaClient,
} from "../_lib/opensea.js";

const REQUIRED = ["write:drops", "write:profile"];

function jwt(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}

function response(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

function config(overrides = {}) {
  return {
    baseUrl: "https://api.opensea.io",
    apiKey: "server-api-key",
    scopedPat: "server-scoped-pat-value",
    dropSlug: "pixel-sheet",
    chain: "ethereum",
    contractAddress: "0x0000000000000000000000000000000000000001",
    shelfTitle: "Pixel Sheet",
    shelfDescription: "Pixel works",
    mockMode: false,
    ...overrides,
  };
}

test("PAT exchange stays server-side and validates exact scopes and expiry", async () => {
  const calls = [];
  const accessToken = jwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  const client = createOpenSeaClient({
    config: config(),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response({
        accessToken,
        tokenType: "Bearer",
        expiresIn: 1800,
        tokenScopes: REQUIRED,
      });
    },
  });

  const result = await client.exchangeScopedPat();
  assert.equal(result.accessToken, accessToken);
  assert.deepEqual(result.scopes, [...REQUIRED].sort());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.opensea.io/api/v2/auth/tokens/exchange");
  assert.equal(calls[0].options.headers["X-API-KEY"], undefined);
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    subjectToken: "server-scoped-pat-value",
    subjectTokenType: "ACCESS_TOKEN",
  });
});

test("PAT exchange reads application permissions from the OpenSea JWT claim", async () => {
  const accessToken = jwt({
    exp: Math.floor(Date.now() / 1000) + 3600,
    opensea_scopes: REQUIRED,
    scope: "openid profile urn:zitadel:iam:org:projects:roles",
  });
  const client = createOpenSeaClient({
    config: config(),
    fetchImpl: async () => response({
      accessToken,
      tokenType: "Bearer",
      expiresIn: 1800,
      tokenScopes: ["openid", "profile", "urn:zitadel:iam:org:projects:roles"],
    }),
  });

  const result = await client.exchangeScopedPat();
  assert.deepEqual(result.scopes, [...REQUIRED].sort());
});

test("scope validation accepts provider scopes but fails closed for missing permissions", () => {
  assert.deepEqual(
    assertRequiredScopes(["write:drops", "write:profile", "openid"]),
    REQUIRED,
  );
  assert.deepEqual(assertRequiredScopes("write:drops,write:profile"), REQUIRED);
  assert.throws(
    () => assertRequiredScopes(["write:drops"]),
    (error) => error instanceof ApiError && error.code === "OPENSEA_SCOPE_MISMATCH",
  );
});

test("media and SelfMint calls use API key plus wallet JWT and validate flat responses", async () => {
  const calls = [];
  const replies = [
    [
      {
        url: "https://storage.example/upload",
        method: "POST",
        fields: { key: "uploads/work.png", "Content-Type": "image/png" },
        token: "media-token",
      },
    ],
    {
      to: "0x0000000000000000000000000000000000000002",
      data: "0x1234",
      value: "0x0",
      chain: "ethereum",
    },
  ];
  const client = createOpenSeaClient({
    config: config(),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response(replies.shift());
    },
  });

  const contexts = await client.getMediaUploadContext({
    slug: "pixel-sheet",
    filenames: ["work.png"],
    accessToken: "wallet-jwt",
  });
  const transaction = await client.prepareSelfMintItem({
    slug: "pixel-sheet",
    item: { media_token: "media-token", name: "Work", supply: "1" },
    accessToken: "wallet-jwt",
  });

  assert.equal(contexts[0].token, "media-token");
  assert.equal(transaction.data, "0x1234");
  for (const call of calls) {
    assert.equal(call.options.headers["X-API-KEY"], "server-api-key");
    assert.equal(call.options.headers.Authorization, "Bearer wallet-jwt");
  }
});

test("SelfMint normalizes a decimal transaction value for the wallet", async () => {
  const client = createOpenSeaClient({
    config: config({ chain: "base" }),
    fetchImpl: async () => response({
      to: "0x0000000000000000000000000000000000000002",
      data: "0x1234",
      value: "0",
      chain: "base",
    }),
  });

  const transaction = await client.prepareSelfMintItem({
    slug: "pixel-sheet",
    item: { media_token: "media-token", name: "Work", supply: "1" },
    accessToken: "wallet-jwt",
  });
  assert.equal(transaction.value, "0x0");
});

test("SelfMint rejects a transaction prepared for a different chain", async () => {
  const client = createOpenSeaClient({
    config: config({ chain: "base" }),
    fetchImpl: async () => response({
      to: "0x0000000000000000000000000000000000000002",
      data: "0x1234",
      value: "0x0",
      chain: "ethereum",
    }),
  });

  await assert.rejects(
    () => client.prepareSelfMintItem({
      slug: "pixel-sheet",
      item: { media_token: "media-token", name: "Work", supply: "1" },
      accessToken: "wallet-jwt",
    }),
    (error) => error instanceof ApiError && error.code === "UPSTREAM_CHAIN_MISMATCH",
  );
});

test("upstream errors never expose OpenSea response bodies", async () => {
  const client = createOpenSeaClient({
    config: config(),
    fetchImpl: async () => response({ error: "contains-sensitive-upstream-detail" }, 403),
  });
  await assert.rejects(
    () => client.getProfileShelves("0x0000000000000000000000000000000000000001"),
    (error) => {
      assert.equal(error.status, 403);
      assert.equal(error.code, "OPENSEA_REQUEST_FAILED");
      assert.doesNotMatch(error.message, /sensitive/);
      return true;
    },
  );
});

test("upstream errors expose only short safe validation messages", async () => {
  const client = createOpenSeaClient({
    config: config(),
    fetchImpl: async () => response({ message: "Supply must be a decimal string." }, 400),
  });
  await assert.rejects(
    () => client.getProfileShelves("0x0000000000000000000000000000000000000001"),
    (error) => {
      assert.equal(error.details.upstreamMessage, "Supply must be a decimal string.");
      return true;
    },
  );
});

test("upload context validation rejects non-HTTPS upload credentials", () => {
  assert.throws(
    () => __openSeaTest.assertUploadContexts([
      { url: "http://storage.example/upload", method: "POST", fields: {}, token: "token" },
    ], 1),
    (error) => error instanceof ApiError && error.code === "UPSTREAM_SCHEMA_MISMATCH",
  );
});
