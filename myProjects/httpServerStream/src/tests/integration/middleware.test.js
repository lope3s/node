import { describe, it, mock, before, after } from "node:test";
import assert from "node:assert";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { createServer } from "node:http";
import { promisify } from "util";
import { unlink, writeFile } from "node:fs/promises";
import { createSign, generateKeyPairSync } from "node:crypto";

describe("Testing authMiddleware fn", () => {
  let serverRef;

  let pvKey;

  const publicFileName = "./.public.key";

  const serverAddress = "http://localhost:8001";

  const cb = mock.fn(async (req, res) => {
    res.end();
  });

  before(async () => {
    await new Promise((resolve) => {
      const server = createServer(async (req, res) => {
        const middleWare = authMiddleware(cb);
        await middleWare(req, res);
      });
      server.listen(8001);
      server.on("listening", async () => {
        const { publicKey, privateKey } = generateKeyPairSync("ec", {
          namedCurve: "sect239k1",
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
        });

        pvKey = privateKey;

        await writeFile(publicFileName, publicKey);
        serverRef = server;
        resolve();
      });
    });
  });

  after(async () => {
    await Promise.all([
      promisify(serverRef.close.bind(serverRef))(),
      unlink(publicFileName),
    ]);
  });

  it("Should return status 401 if header Authorization is not present", async () => {
    const response = await fetch(serverAddress);
    const responseBody = await response.json();

    assert.strictEqual(response.status, 401);
    assert.strictEqual(cb.mock.calls.length, 0);
    assert.strictEqual(
      response.headers.get("content-type"),
      "application/json"
    );
    assert.deepStrictEqual(responseBody, {
      error: "Missing Authorization header",
    });
  });

  it("Should return status 401 if header Authorization is invalid", async () => {
    const response = await fetch(serverAddress, {
      headers: {
        //wrong token format
        Authorization: "alskdjhflkasjhdflkajshdflkajshdflkajsdhf",
      },
    });
    const responseBody = await response.json();

    assert.strictEqual(response.status, 401);
    assert.strictEqual(cb.mock.calls.length, 0);
    assert.strictEqual(
      response.headers.get("content-type"),
      "application/json"
    );
    assert.deepStrictEqual(responseBody, {
      error: "SyntaxError",
    });
  });

  it("Should call the next route if Authorization header is valid", async () => {
    const header = Buffer.from(
      JSON.stringify({
        alg: "sha256",
        typ: "jwt",
      })
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({
        test: "test",
      })
    ).toString("base64url");

    const sign = createSign("sha256");
    sign.write(`${header}.${payload}`);
    sign.end();
    const signature = sign.sign(pvKey, "base64url");

    await fetch(serverAddress, {
      headers: {
        Authorization: `${header}.${payload}.${signature}`,
      },
    });

    assert.strictEqual(cb.mock.calls.length, 1);
  });
});
