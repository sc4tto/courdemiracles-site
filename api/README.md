# Pixel Sheet ↔ OpenSea backend (Vercel beta)

This directory contains Node.js Vercel Functions for a **single-owner** Pixel Sheet/OpenSea workflow. The browser may request upload credentials and ready-to-sign transaction data, but it never receives the OpenSea API key, scoped PAT, wallet JWT, or a private key. Mint transactions are signed and broadcast only by the user's wallet after explicit confirmation.

The selected target is **Base mainnet** (`OPENSEA_CHAIN=base`, chain ID `8453`). The authorized wallet must hold enough ETH on Base to cover the network fee before a real mint is attempted.

This is a backend beta, not a deployed production service. It does not modify or deploy the existing static website.

## Authentication model

OpenSea's current authentication separates an API key from wallet authorization:

1. Manually create an OpenSea scoped personal access token (PAT) in **OpenSea → Settings → Developer** for the same wallet configured in `ALLOWED_WALLET_ADDRESS`.
2. Give the PAT **exactly** the scopes `write:drops` and `write:profile`.
3. Store the API key and PAT only as Vercel Sensitive Environment Variables.
4. The site requests a local wallet challenge from this backend and the browser signs its exact text.
5. After checking that signature against the allowlisted wallet, the backend exchanges the PAT at `POST /api/v2/auth/tokens/exchange`.
6. The resulting short-lived OpenSea wallet JWT is kept inside an AES-256-GCM encrypted, `HttpOnly` cookie. It is never returned in JSON.

The local challenge is an owner gate for this personal app. It is deliberately **not** a replacement implementation of OpenSea OAuth or OpenSea SIWE/PAT creation. A future multi-user version must use OpenSea OAuth 2.1 with PKCE or its documented SIWE session flow and registered redirect/client configuration. It must not reuse this single-wallet allowlist design.

Official references, verified against the live specification on 2026-09-08:

- [OpenSea authentication](https://docs.opensea.io/reference/auth)
- [Live OpenSea OpenAPI](https://api.opensea.io/api/v2/openapi.json)
- [Upload drop item media](https://docs.opensea.io/reference/upload_drop_item_media)
- [Create a SelfMint item](https://docs.opensea.io/reference/save_self_mint_drop_item)
- [Profile shelves](https://docs.opensea.io/reference/get_profile_shelves)

## Environment variables

Copy `.env.example` to a local `.env` and keep that file untracked. In Vercel, add secret values under **Project → Settings → Environment Variables**.

| Variable | Required | Purpose |
|---|---:|---|
| `ALLOWED_ORIGINS` | yes | Comma-separated exact browser origins; HTTPS is required outside localhost and `*` is rejected. |
| `SESSION_SECRET` | yes | Exactly 32 random bytes encoded as base64. Generate with `openssl rand -base64 32`. |
| `SESSION_COOKIE_PREFIX` | no | Cookie namespace; default `cdm_pixel`. |
| `COOKIE_SECURE` | yes in production | Must remain `true` over HTTPS. |
| `COOKIE_SAME_SITE` | yes | Use `Lax` for a same-site API subdomain; use `None` (with `Secure`) when calling a `*.vercel.app` API cross-site. |
| `ALLOWED_WALLET_ADDRESS` | yes | The only EVM wallet allowed to administer Pixel Sheet; it should own the OpenSea PAT. |
| `AUTH_CHAIN_ID` | no | Chain ID written into the signed local challenge; default `8453` (Base). |
| `AUTH_SESSION_MINUTES` | no | Challenge lifetime, 2–60 minutes; default `10`. |
| `OPENSEA_API_KEY` | yes | Server-side OpenSea API key. |
| `OPENSEA_SCOPED_PAT` | yes | Server-side scoped PAT with exactly `write:drops write:profile`. Never send it as a bearer token. |
| `OPENSEA_API_BASE_URL` | no | Defaults to `https://api.opensea.io`; must be an HTTPS origin without a path. |
| `DROP_SLUG` | yes for media/mint | Creator Studio SelfMint drop slug. |
| `OPENSEA_CHAIN` | yes for shelf sync | OpenSea chain slug; this project uses `base`. |
| `OPENSEA_CONTRACT_ADDRESS` | yes for media/mint/shelf sync | Contract allowed in the Pixel Sheet shelf; mint preparation fails closed until it is set so completed mints remain eligible for automatic album sync. |
| `OPENSEA_SHELF_TITLE` | no | Fixed managed shelf title; default `Pixel Sheet`. |
| `OPENSEA_SHELF_DESCRIPTION` | no | Description used when the managed shelf is first created. |
| `OPENSEA_MOCK_MODE` | local only | Enables deterministic mock responses. It is forcibly disabled on Vercel and when `NODE_ENV=production`. |

Recommended production topology: serve the API from `api.courdemiracles.net`, keep `ALLOWED_ORIGINS=https://courdemiracles.net`, and keep `COOKIE_SAME_SITE=Lax`. If the frontend also uses `www`, add its exact origin as a second comma-separated value.

## Local checks

The repository targets Node `22.x`, matching the Vercel runtime declared in `package.json`.

```bash
npm install
npm run check
npm test
```

For local mock mode, configure a test wallet address and session secret, then set `OPENSEA_MOCK_MODE=true`. The mock upload URLs use `example.invalid` intentionally and do not accept bytes; mock mode verifies UI/control flow, not storage or blockchain execution.

## Browser/API contract

Every browser call must set `credentials: "include"`. Post-authentication mutations must also send the exact `X-CSRF-Token` returned by `/api/auth/verify` (or `/api/auth/session`).

| Method | Route | Body/result |
|---|---|---|
| `GET` | `/api/health` | Liveness only; returns no configuration or secret. |
| `GET` | `/api/config` | Safe readiness flags, chain, shelf title, and required scopes; never secret values. |
| `POST` | `/api/auth/challenge` | `{address}` → exact `{address,message,expiresAt}` to sign. |
| `POST` | `/api/auth/verify` | `{address,message,signature}` → `{authenticated,address,csrfToken,expiresAt,scopes}` and encrypted cookie. |
| `GET` | `/api/auth/session` | Restores safe session state and CSRF token; never returns the JWT. |
| `POST` | `/api/auth/logout` | Clears all backend cookies. Requires the current session + CSRF. |
| `POST` | `/api/media/context` | `{filenames:["name.png"]}` → one sensitive, short-lived OpenSea upload context. Exactly one `.png` is accepted. Requires session + CSRF. |
| `POST` | `/api/mint/prepare` | `{mediaToken,name,description?,supply:"1",traits?,externalUrl?,animationUrl?}` → ready-to-sign `{transaction}`. Supply is fixed at one. Requires session + CSRF. |
| `GET` | `/api/shelves` | Returns only the configured Pixel Sheet shelf for the configured owner. |
| `POST` | `/api/shelves/sync` | `{item:{chain,contractAddress,tokenId},description?}` → creates/updates the fixed shelf idempotently. Requires session + CSRF. |

The expected browser sequence is:

1. Request a challenge, sign the exact `message` through an injected wallet provider, and verify it.
2. Request a media context immediately before upload.
3. Upload bytes directly to the returned HTTPS storage URL using every returned field unchanged. Treat the URL, fields, and token as sensitive and never log or persist them.
4. Only after the storage endpoint returns 2xx, pass the returned media token to `/api/mint/prepare`.
5. Show `chain`, `to`, `value`, and the action to the person; then let the wallet sign and broadcast the returned transaction.
6. Wait for a successful on-chain receipt and obtain the token ID before calling `/api/shelves/sync`.

OpenSea's current upload schema describes a multipart “file part” but does not name that form field. The backend therefore does not guess or proxy the bytes. Before wiring the production upload UI, confirm the required part name with a real OpenSea test context or updated official documentation. Do not mint with a media token before its storage upload succeeds.

## Security and operational constraints

- No code path accepts, stores, or uses a wallet private key.
- CORS allows only configured exact origins and browser credentials; wildcard origins fail closed.
- Session contents are encrypted and authenticated with AES-256-GCM, bound to the cookie name, size-limited, and stored in `HttpOnly`, `Secure` cookies.
- The PAT is exchanged only server-side. The exchanged JWT is sent only from Vercel to OpenSea with the server API key.
- OpenSea error bodies are not forwarded because they may contain operational detail. Status and a sanitized retry delay are returned instead.
- The managed shelf is restricted to one configured title, chain, contract, and wallet. The sync route preserves existing items and sends OpenSea's required nested PATCH item shape.
- OpenSea documents shelf PATCH as non-atomic. The route changes only the `items` field, but a failed item-description update may still require inspection in OpenSea.
- Idempotency is read-before-write. Two simultaneous first-time sync calls could race and create duplicate titled shelves; serialize calls in the UI and resolve duplicate titles manually if the API reports `SHELF_AMBIGUOUS`.
- A 429 is not automatically retried. Respect the returned `retryAfter` detail and require a new explicit user action.
- Revoke or rotate the scoped PAT in OpenSea if it is exposed or no longer needed. Existing exchanged JWTs can remain valid until their short expiry.

## Deployment checklist

1. Create a Vercel project from this repository with the repository root as the project root.
2. Add all required environment variables separately for Preview and Production; mark API key, PAT, and session secret as Sensitive.
3. Use a preview origin only in Preview's `ALLOWED_ORIGINS`. Do not add wildcards.
4. Run the test suite, then deploy Preview first.
5. Verify `/api/config` shows every required flag as configured without revealing a value.
6. Test with a minimally funded wallet and a disposable/test drop before production.
7. Confirm the wallet prompt and transaction fields manually; do not auto-sign or auto-broadcast.
8. Add the production API hostname/DNS only after the Preview flow passes.
