import { createServer } from "node:net";
import { createHash } from "node:crypto";

// Chat:
// The goal of this project is to:
// Practice TDD;
// Understand how Node Net module works and how to work with sockets;
// Further learning in streams;

const MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

function hash(data) {
  const hash = createHash("sha1");

  hash.update(data);
  return hash.digest("base64");
}

function getHeaders(data) {
  const headers = {};

  const lines = data.split("\n");

  if (lines[0].includes("GET") && lines[0].includes("HTTP/1.1")) {
    lines
      .filter((head) => head.includes(":"))
      .forEach((head) => {
        const [key, value] = head.split(":");
        headers[key] = value.replaceAll("\r", "").trim();
      });

    return headers;
  }

  return null;
}

function createHandShakeHeaders(headers) {
  const isUpgradingToWs = headers["Upgrade"] === "websocket";
  const isUpgradingConnection = headers["Connection"].includes("Upgrade");
  if (isUpgradingConnection && isUpgradingToWs) {
    const secWebSocketKey = headers["Sec-WebSocket-Key"];
    const secWebSocketAccept = hash(secWebSocketKey + MAGIC_STRING);

    return [
      "HTTP/1.1 101 Switching Protocols\r\n",
      "Upgrade: websocket\r\n",
      "Connection: Upgrade\r\n",
      `Sec-WebSocket-Accept: ${secWebSocketAccept}\r\n`,
      "\r\n",
    ];
  }

  return [];
}

const server = createServer((connection) => {
  connection.on("data", (data) => {
    const headers = getHeaders(data.toString());
    if (headers) {
      const handShakeHeaders = createHandShakeHeaders(headers);
      connection.write(handShakeHeaders.join(""));
      return;
    }

    console.log(data.readUInt8());
  });
});

server.listen(5001).on("listening", () => console.log("Listening on 5001"));
