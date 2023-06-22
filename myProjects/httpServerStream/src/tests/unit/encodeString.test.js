import { describe, it } from "node:test";
import { encodeString } from "../../util/index.js";
import assert from "node:assert";

describe("Testing encodeString fn", () => {
  const testData = JSON.stringify({ test: "test" });

  it("Should return a string of the provided payload in the provided encoding", () => {
    const base64 = encodeString(testData, "base64");

    const encodedString = btoa(testData);
    assert.strictEqual(base64, encodedString);
  });
});
