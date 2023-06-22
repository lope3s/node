import { describe, it } from "node:test";
import assert from "node:assert";
import { createJWT } from "../../util/index.js";
import { createVerify, generateKeyPairSync } from "node:crypto";

describe("Testing createJWT fn", () => {
  const testData = { test: "test" };
  const defaultHeader = {
    alg: "SHA256",
    typ: "JWT",
  };

  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "sect239k1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  it("Should return a token in the JWT pattern", async () => {
    const jwt = createJWT(privateKey, testData);

    const [header, payload, signature] = jwt.split(".");

    const base64HeaderToJSON = atob(header);
    const base64PayloadToJSON = atob(payload);

    assert.strictEqual(base64HeaderToJSON, JSON.stringify(defaultHeader));
    assert.strictEqual(base64PayloadToJSON, JSON.stringify(testData));

    const verify = createVerify(JSON.parse(base64HeaderToJSON)["alg"]);
    verify.write(`${header}.${payload}`);
    verify.end();

    const isVerified = verify.verify(publicKey, signature, "base64url");

    assert.strictEqual(isVerified, true);
  });
});
