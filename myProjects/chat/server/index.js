import { createServer } from "node:net";
import { createHash } from "node:crypto";
import { argv0 } from "node:process";

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

    //data is a buffer, a buffer is a collection of binary data;
    //as specified in MDN, we need to know the length of the payload
    //which is contained in the second byte in the buffer;

    //MDN also states that from this second bythe we should read bites 1 to 7 (inclusive);
    //we should ignore the first byte as it only informs if the payload is masked or not;

    console.log("second byte from buffer:", data[1]); //this will log a uint8(0-255) representation of the second byte;
    //Remember that this is logging the whole byte (mask + payload length);
    //We can get a binary visualization of this byte with:
    console.log("Byte to binary:", data[1].toString(2));
    //This will give us a string representation of the 8 bits that form this current byte;
    //Now we can slice this string to get only the last 7 bits with the payload length:
    console.log(
      "Getting only the bits that represents the payload length:",
      data[1].toString(2).slice(1)
    );
    //If we read this as a uint8 we should get the payload length of the message:
    console.log(
      "Converting bits to uint to discover payload length:",
      parseInt(data[1].toString(2).slice(1), 2)
    );
  });
});

server.listen(5001).on("listening", () => console.log("Listening on 5001"));
