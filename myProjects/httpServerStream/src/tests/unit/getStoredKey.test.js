import { describe, it, after } from "node:test";
import assert from "node:assert";
import { getStoredKey } from "../../util/index.js";
import { generateKeyPairSync } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";

describe("Testing getStoredKey fn", () => {
  const filename = "./.private.test.key";

  after(async () => await unlink(filename));

  it("Should return null if file doesn't exist", async () => {
    const privateKey = await getStoredKey(filename);
    assert.strictEqual(privateKey, null);
  });

  it("Should return the stored privateKey in the pem format", async () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    await writeFile(filename, privateKey);

    const pKey = await getStoredKey(filename);

    assert.strictEqual(privateKey, pKey);
  });
});
