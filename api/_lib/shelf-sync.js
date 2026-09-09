import { ApiError } from "./errors.js";

function sameItem(left, right) {
  return (
    left.chain === right.chain &&
    left.contract_address.toLowerCase() === right.contract_address.toLowerCase() &&
    left.token_id === right.token_id
  );
}

function updateEntries(items, target, description) {
  return items.map((item) => {
    const entry = { item };
    if (description !== undefined && sameItem(item, target)) entry.description = description;
    return entry;
  });
}

export async function syncPixelSheetShelf({ client, config, address, accessToken, item, description }) {
  const shelves = await client.getProfileShelves(address);
  const matches = shelves.filter((shelf) => shelf.title === config.shelfTitle);
  if (matches.length > 1) {
    throw new ApiError(
      409,
      "SHELF_AMBIGUOUS",
      "More than one OpenSea shelf uses the configured Pixel Sheet title.",
    );
  }

  if (!matches.length) {
    let shelf = await client.createProfileShelf(
      {
        title: config.shelfTitle,
        description: config.shelfDescription,
        items: [item],
      },
      accessToken,
    );
    if (description !== undefined) {
      shelf = await client.updateProfileShelf(
        shelf.id,
        { items: [{ item, description }] },
        accessToken,
      );
    }
    return { action: "created", shelf };
  }

  const current = matches[0];
  const alreadyPresent = current.items.some((existing) => sameItem(existing, item));
  if (alreadyPresent && description === undefined) {
    return { action: "unchanged", shelf: current };
  }
  if (!alreadyPresent && current.items.length >= 50) {
    throw new ApiError(409, "SHELF_FULL", "The Pixel Sheet shelf already contains 50 items.");
  }

  const items = alreadyPresent ? current.items : [...current.items, item];
  const shelf = await client.updateProfileShelf(
    current.id,
    { items: updateEntries(items, item, description) },
    accessToken,
  );
  return { action: "updated", shelf };
}

export const __shelfSyncTest = Object.freeze({ sameItem, updateEntries });
