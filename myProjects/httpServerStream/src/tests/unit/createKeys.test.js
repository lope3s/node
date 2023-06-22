import { describe, it, after } from "node:test";
import assert from "node:assert";
import { createKeys } from "../../util/index.js";
import { open, readFile, unlink } from "node:fs/promises";

describe("Testing createKeys fn", () => {
  const publicKeysFilename = "./.public.test.key";
  const privateKeysFilename = "./.private.test.key";

  after(
    async () =>
      await Promise.all([
        unlink(publicKeysFilename),
        unlink(privateKeysFilename),
      ])
  );

  it("Should create a file and write the key into it if the file doesn't exist", async () => {
    await createKeys({
      publicKey: publicKeysFilename,
      privateKey: privateKeysFilename,
    });

    const [publicKey, privateKey] = await Promise.all([
      readFile(publicKeysFilename, "utf8"),
      readFile(privateKeysFilename, "utf8"),
    ]);

    assert.ok(publicKey.length);
    assert.ok(privateKey.length);
  });

  it("Should write the key into the file if the file exists but its empty", async () => {
    const files = await Promise.all([
      open(publicKeysFilename, "w"),
      open(privateKeysFilename, "w"),
    ]);

    for (const file of files) {
      await file.close();
    }

    await createKeys({
      publicKey: publicKeysFilename,
      privateKey: privateKeysFilename,
    });

    const [publicKey, privateKey] = await Promise.all([
      readFile(publicKeysFilename, "utf8"),
      readFile(privateKeysFilename, "utf8"),
    ]);

    assert.ok(publicKey.length);
    assert.ok(privateKey.length);
  });
});
