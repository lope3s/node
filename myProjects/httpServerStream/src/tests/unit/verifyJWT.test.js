import { describe, it } from "node:test";
import assert from "node:assert";
import { verifyJWT } from "../../util/index.js";
import { createSign, generateKeyPairSync } from "node:crypto";

describe("Testing verifyJWT fn", () => {
  const defaultHeader = Buffer.from(
    JSON.stringify({
      typ: "JWT",
      alg: "SHA256",
    })
  ).toString("base64url");

  const base64urlPayload = Buffer.from(
    JSON.stringify({
      test: "test",
    })
  ).toString("base64url");

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

  const sign = createSign("sha256");
  sign.write(`${defaultHeader}.${base64urlPayload}`);
  sign.end();

  const base64urlSignature = sign.sign(privateKey, "base64url");

  it("Should verify if the typ property of the header is JWT", () => {
    const header = Buffer.from(
      JSON.stringify({
        typ: "asdf",
      })
    ).toString("base64url");

    const token = `${header}.${base64urlPayload}.${base64urlSignature}`;

    const verify = verifyJWT(publicKey, token);

    assert.strictEqual(verify.valid, false);
    assert.strictEqual(verify.error, "Header typ property is not JWT");
  });

  it("Should verify if the header has the property alg", () => {
    const header = Buffer.from(
      JSON.stringify({
        typ: "jwt",
      })
    ).toString("base64url");

    const token = `${header}.${base64urlPayload}.${base64urlSignature}`;

    const verify = verifyJWT(publicKey, token);

    assert.strictEqual(verify.valid, false);
    assert.strictEqual(
      verify.error,
      "Invalid token header, missing alg property"
    );
  });

  it("Should return valid as false if the token is not in JWT standard", () => {
    const verify = verifyJWT(
      publicKey,
      "asdfklajshdlfkjahsdfiopuqwerariuewuaksdfadblasdhfiuoqwerpqweir"
    );

    assert.strictEqual(verify.valid, false);
  });

  it("Should return valid as false and error as Invalid token if the provided token is invalid for some other reason", () => {
    const token = `${defaultHeader}.${base64urlPayload}asdf.${base64urlSignature}`;

    const verify = verifyJWT(publicKey, token);

    assert.strictEqual(verify.error, "Invalid token");
    assert.strictEqual(verify.valid, false);
  });

  it("Should return valid as true and error as null if the token is valid", () => {
    const token = `${defaultHeader}.${base64urlPayload}.${base64urlSignature}`;

    const verify = verifyJWT(publicKey, token);

    assert.strictEqual(verify.error, null);
    assert.strictEqual(verify.valid, true);
  });
});
