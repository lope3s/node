const assert = require("assert");
const { IncomingMessage } = require("http");
const { Socket } = require("net");
const { describe, it } = require("node:test");
const getRequestBody = require("../helpers/getRequestBody");

describe("Testing getRequestBody function", () => {
  it("Should append the request data to the request body", async () => {
    const socket = new Socket();
    const incomingMessage = new IncomingMessage(socket);
    incomingMessage.headers["content-type"] = "application/json";

    const body = getRequestBody(incomingMessage);

    const expected = { test: "test" };

    for (const character of JSON.stringify(expected)) {
      const buffer = Buffer.from(character);
      incomingMessage.emit("data", buffer);
    }

    incomingMessage.emit("end");

    assert.deepStrictEqual(await body, expected);
  });
});
