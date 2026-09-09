import test from "node:test";
import assert from "node:assert/strict";
import { syncPixelSheetShelf } from "../_lib/shelf-sync.js";

const first = {
  chain: "ethereum",
  contract_address: "0x0000000000000000000000000000000000000001",
  token_id: "1",
};
const second = { ...first, token_id: "2" };
const config = { shelfTitle: "Pixel Sheet", shelfDescription: "Pixel works" };

function shelf(items = [first]) {
  return {
    id: "shelf-1",
    title: "Pixel Sheet",
    display_order: 0,
    items,
    shelf_item_metadata: {},
  };
}

test("shelf sync is idempotent when an item already exists", async () => {
  let updates = 0;
  const client = {
    getProfileShelves: async () => [shelf()],
    updateProfileShelf: async () => {
      updates += 1;
    },
  };
  const result = await syncPixelSheetShelf({
    client,
    config,
    address: "wallet",
    accessToken: "token",
    item: first,
  });
  assert.equal(result.action, "unchanged");
  assert.equal(updates, 0);
});

test("shelf sync preserves existing items and uses nested PATCH entries", async () => {
  let patch;
  const client = {
    getProfileShelves: async () => [shelf()],
    updateProfileShelf: async (id, body) => {
      patch = { id, body };
      return shelf([first, second]);
    },
  };
  const result = await syncPixelSheetShelf({
    client,
    config,
    address: "wallet",
    accessToken: "token",
    item: second,
    description: "Second work",
  });
  assert.equal(result.action, "updated");
  assert.deepEqual(patch, {
    id: "shelf-1",
    body: {
      items: [
        { item: first },
        { item: second, description: "Second work" },
      ],
    },
  });
});

test("shelf sync creates the fixed shelf and then applies an item description", async () => {
  const calls = [];
  const created = shelf([first]);
  const client = {
    getProfileShelves: async () => [],
    createProfileShelf: async (body) => {
      calls.push(["create", body]);
      return created;
    },
    updateProfileShelf: async (id, body) => {
      calls.push(["update", id, body]);
      return created;
    },
  };
  const result = await syncPixelSheetShelf({
    client,
    config,
    address: "wallet",
    accessToken: "token",
    item: first,
    description: "First work",
  });
  assert.equal(result.action, "created");
  assert.deepEqual(calls, [
    ["create", { title: "Pixel Sheet", description: "Pixel works", items: [first] }],
    ["update", "shelf-1", { items: [{ item: first, description: "First work" }] }],
  ]);
});
