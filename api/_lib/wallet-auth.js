import { getAddress, verifyMessage } from "ethers";
import { ApiError } from "./errors.js";
import { evmAddress } from "./validation.js";

const STATEMENT =
  "Authorize Pixel Sheet to prepare OpenSea actions with write:drops and write:profile. This signature is free and does not submit a blockchain transaction.";

export function canonicalAddress(value) {
  evmAddress(value);
  try {
    return getAddress(value);
  } catch {
    throw new ApiError(400, "INVALID_REQUEST", "address has an invalid EVM checksum.");
  }
}

export function assertAllowedWallet(address, allowedAddress) {
  const actual = canonicalAddress(address);
  let allowed;
  try {
    allowed = getAddress(allowedAddress);
  } catch {
    throw new ApiError(503, "CONFIGURATION_INVALID", "ALLOWED_WALLET_ADDRESS is invalid.");
  }
  if (actual !== allowed) {
    throw new ApiError(403, "WALLET_FORBIDDEN", "This wallet is not allowed to administer Pixel Sheet.");
  }
  return actual;
}

export function buildWalletChallenge({ address, origin, chainId, nonce, issuedAt, expirationTime }) {
  const host = new URL(origin).host;
  return [
    `${host} wants you to sign in with your Ethereum account:`,
    address,
    "",
    STATEMENT,
    "",
    `URI: ${origin}/apps/pixel-sheet-converter/`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    `Expiration Time: ${expirationTime}`,
  ].join("\n");
}

export function verifyWalletChallenge(message, signature, expectedAddress) {
  let recovered;
  try {
    recovered = getAddress(verifyMessage(message, signature));
  } catch {
    throw new ApiError(401, "SIGNATURE_INVALID", "Wallet signature could not be verified.");
  }
  if (recovered !== getAddress(expectedAddress)) {
    throw new ApiError(401, "SIGNATURE_INVALID", "Wallet signature does not match the requested address.");
  }
  return recovered;
}
