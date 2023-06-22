import { describe, it } from "node:test";
import { getQuery } from "../../util/index.js";
import assert from "node:assert";

describe("Testing getQuery fn", () => {
  const testUrl = "http://localhost:3000";
  it("Should return an empty object if the urlSearchParams is empty", () => {
    const { searchParams } = new URL(testUrl);

    const queryObj = getQuery(searchParams);

    assert.deepStrictEqual(queryObj, {});
  });
  it("Should parse the values from the urlSearchParams into a proper object", () => {
    const { searchParams } = new URL(testUrl + "?test=asdf");
    const queryObj = getQuery(searchParams);

    assert.deepStrictEqual(queryObj, { test: "asdf" });
  });
});
