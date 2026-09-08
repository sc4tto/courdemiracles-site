import { ApiError } from "./errors.js";

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HEX_SIGNATURE = /^0x[0-9a-fA-F]{130}$/;
const SAFE_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/;
const SAFE_CHAIN = /^[a-z0-9][a-z0-9_-]{0,49}$/;

function invalid(message) {
  throw new ApiError(400, "INVALID_REQUEST", message);
}

export function objectValue(value, label = "body") {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid(`${label} must be an object.`);
  return value;
}

export function stringValue(value, label, { min = 1, max = 1000, optional = false } = {}) {
  if (optional && (value === undefined || value === null)) return undefined;
  if (typeof value !== "string") invalid(`${label} must be a string.`);
  if (value.length < min || value.length > max) {
    invalid(`${label} must contain between ${min} and ${max} characters.`);
  }
  return value;
}

export function evmAddress(value, label = "address") {
  if (typeof value !== "string" || !EVM_ADDRESS.test(value)) {
    invalid(`${label} must be an EVM address.`);
  }
  return value;
}

export function signatureValue(value) {
  if (typeof value !== "string" || !HEX_SIGNATURE.test(value)) {
    invalid("signature must be a 65-byte hexadecimal personal-sign signature.");
  }
  return value;
}

export function slugValue(value, label = "slug") {
  if (typeof value !== "string" || !SAFE_SLUG.test(value)) invalid(`${label} is invalid.`);
  return value;
}

export function filenameValue(value) {
  const filename = stringValue(value, "filename", { min: 1, max: 255 });
  if (filename.includes("/") || filename.includes("\\") || /[\u0000-\u001f]/.test(filename)) {
    invalid("filename must be a base filename without path separators.");
  }
  return filename;
}

export function mediaContextInput(body, configuredSlug) {
  const input = objectValue(body);
  const slug = configuredSlugValue(input.slug, configuredSlug);
  if (!Array.isArray(input.filenames) || input.filenames.length !== 1) {
    invalid("filenames must contain exactly one Pixel Sheet PNG.");
  }
  const filenames = input.filenames.map(filenameValue);
  if (!filenames[0].toLowerCase().endsWith(".png")) {
    invalid("The Pixel Sheet media filename must end in .png.");
  }
  return { slug, filenames };
}

function optionalUrl(value, label) {
  if (value === undefined) return undefined;
  const result = stringValue(value, label, { min: 0, max: 1000 });
  if (result === "") return result;
  let url;
  try {
    url = new URL(result);
  } catch {
    invalid(`${label} must be an absolute URL.`);
  }
  if (url.protocol !== "https:") invalid(`${label} must use HTTPS.`);
  return result;
}

export function selfMintInput(body, configuredSlug) {
  const input = objectValue(body);
  const slug = configuredSlugValue(input.slug, configuredSlug);
  const mediaToken = stringValue(input.mediaToken, "mediaToken", { min: 1, max: 8192 });
  const name = stringValue(input.name, "name", { min: 1, max: 100 });
  const supply = stringValue(input.supply, "supply", { min: 1, max: 78 });
  if (supply !== "1") invalid("Pixel Sheet SelfMint supply must be exactly \"1\".");
  const description = stringValue(input.description, "description", {
    min: 0,
    max: 2000,
    optional: true,
  });
  const externalUrl = optionalUrl(input.externalUrl, "externalUrl");
  const animationUrl = optionalUrl(input.animationUrl, "animationUrl");

  const traits = input.traits === undefined ? [] : input.traits;
  if (!Array.isArray(traits) || traits.length > 40) invalid("traits must contain at most 40 entries.");
  const normalizedTraits = traits.map((trait, index) => {
    const value = objectValue(trait, `traits[${index}]`);
    return {
      trait_type: stringValue(value.traitType, `traits[${index}].traitType`, { max: 100 }),
      value: stringValue(value.value, `traits[${index}].value`, { max: 500 }),
    };
  });

  const item = { media_token: mediaToken, name, supply };
  if (description !== undefined) item.description = description;
  if (externalUrl !== undefined) item.external_url = externalUrl;
  if (animationUrl !== undefined) item.animation_url = animationUrl;
  if (normalizedTraits.length) item.traits = normalizedTraits;
  return { slug, item };
}

function shelfItem(value, index, configuredChain, configuredContract) {
  const item = objectValue(value, `items[${index}]`);
  const chain = stringValue(item.chain || configuredChain, `items[${index}].chain`, { max: 50 });
  if (!SAFE_CHAIN.test(chain)) invalid(`items[${index}].chain is invalid.`);
  if (configuredChain && chain !== configuredChain) {
    invalid(`items[${index}].chain must match the configured Pixel Sheet chain.`);
  }
  const contractAddress = evmAddress(
    item.contractAddress || configuredContract,
    `items[${index}].contractAddress`,
  );
  if (configuredContract && contractAddress.toLowerCase() !== configuredContract.toLowerCase()) {
    invalid(`items[${index}].contractAddress must match the configured Pixel Sheet contract.`);
  }
  return {
    chain,
    contract_address: contractAddress,
    token_id: stringValue(item.tokenId, `items[${index}].tokenId`, { min: 1, max: 200 }),
  };
}

export function shelfInput(body, config) {
  const input = objectValue(body);
  if (input.title !== undefined && input.title !== config.shelfTitle) {
    invalid("title must match the configured Pixel Sheet shelf title.");
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) {
    invalid("items must contain between 1 and 50 NFTs.");
  }
  const description = stringValue(input.description, "description", {
    min: 0,
    max: 500,
    optional: true,
  });
  const icon = stringValue(input.icon, "icon", { min: 0, max: 100, optional: true });
  const view = stringValue(input.view, "view", { min: 0, max: 100, optional: true });
  const singleItemShelfSide = stringValue(input.singleItemShelfSide, "singleItemShelfSide", {
    min: 0,
    max: 100,
    optional: true,
  });
  const result = {
    title: config.shelfTitle,
    description: description ?? config.shelfDescription,
    items: input.items.map((item, index) =>
      shelfItem(item, index, config.chain, config.contractAddress),
    ),
  };
  if (icon !== undefined) result.icon = icon;
  if (view !== undefined) result.view = view;
  if (singleItemShelfSide !== undefined) {
    result.single_item_shelf_side = singleItemShelfSide;
  }
  return result;
}

function configuredSlugValue(requestedSlug, configuredSlug) {
  const slug = slugValue(configuredSlug, "configured slug");
  if (requestedSlug !== undefined && slugValue(requestedSlug, "slug") !== slug) {
    invalid("slug must match the configured Pixel Sheet collection.");
  }
  return slug;
}

export function assertTransaction(value, expectedChain) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned an invalid transaction response.");
  }
  const transaction = value;
  if (typeof transaction.to !== "string" || !EVM_ADDRESS.test(transaction.to)) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned an invalid transaction target.");
  }
  if (typeof transaction.data !== "string" || !/^0x[0-9a-fA-F]*$/.test(transaction.data)) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned invalid transaction data.");
  }
  if (typeof transaction.value !== "string" || !/^0x[0-9a-fA-F]+$/.test(transaction.value)) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned an invalid transaction value.");
  }
  if (typeof transaction.chain !== "string" || !SAFE_CHAIN.test(transaction.chain)) {
    throw new ApiError(502, "UPSTREAM_SCHEMA_MISMATCH", "OpenSea returned an invalid transaction chain.");
  }
  if (expectedChain && transaction.chain !== expectedChain) {
    throw new ApiError(
      502,
      "UPSTREAM_CHAIN_MISMATCH",
      "OpenSea returned a transaction for a different blockchain.",
    );
  }
  return transaction;
}

export function shelfSyncInput(body, config) {
  const input = objectValue(body);
  const item = shelfItem(input.item, 0, config.chain, config.contractAddress);
  const description = stringValue(input.description, "description", {
    min: 0,
    max: 500,
    optional: true,
  });
  return { item, description };
}
