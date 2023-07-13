import { createHash } from "node:crypto";

// This is a string defined in the websocket protocol;
const MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

export function hash(data) {
  const hash = createHash("sha1");

  hash.update(data);
  return hash.digest("base64");
}

export function getHeaders(data) {
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

export function createHandShakeHeaders(headers) {
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

export const sendMessage = (data) => {
  const msg = Buffer.from(data);
  const msgLen = msg.length;

  let dataFrameBuffer;

  // The numerical representation for 10000000 is 128, this as stated by the websocket protocol,
  // is the correct representation for our message first byte because our FIN bit is 1 and that
  // means that we're sending a single-frame message and all the te other bites are zeroes by default
  // as a 0 byte is filled with 8 zeroed bits.
  // We also need to add the OP CODE to indicate that our payload is text, and by the specification
  // this is represented by 1 or 0x01;
  const fistByte =
    0x80 /*hex representation for 128*/ | 0x01; /*hex representation for 1*/
  // | here is a bitwise operator that returns a 0 in each bit position that both corresponding
  // bits are 0, returns 1 otherwise.
  // (0x80).toString(2) == '10000000'
  // (0x01).toString(2) == '00000001'
  // 0x80 | 0x1         == '10000001'

  if (msgLen <= 125) {
    dataFrameBuffer = Buffer.from([fistByte, msgLen]);
  }
  if (msgLen <= 126) {
    const offsetFourBytes = 4;
    const t = Buffer.allocUnsafe(offsetFourBytes);
    t[0] = fistByte;
    // this is the payload length marker + the mask indicator
    t[1] = 126 | 0x00;
    // this will add the content length to t which is 2 bytes lenght
    t.writeUint16BE(msgLen, 2);

    // the last byte, the message itself, will be added latter.
    dataFrameBuffer = t;
  } else {
    throw new Error("message too long");
  }

  const target = Buffer.allocUnsafe(dataFrameBuffer.byteLength + msgLen);

  let offset = 0;

  for (const buffer of [dataFrameBuffer, msg]) {
    target.set(buffer, offset);
    offset += buffer.length;
  }

  return target;
};

export function howToReadBitsWithinBytes(buffer) {
  //A Buffer is a collection of binary data;
  //as specified in MDN, we need to know the length of the payload
  //which is contained in the second byte in the buffer;

  //MDN also states that from this second byte we should read bits 1 to 7 (inclusive);
  //we should ignore the first byte as it only informs if the payload is masked or not;

  console.log("second byte from buffer:", buffer[1]); //this will log a uint8(0-255) representation of the second byte;
  //Remember that this is logging the whole byte (mask + payload length);
  //We can get a binary visualization of this byte with:
  console.log("Byte to binary:", buffer[1].toString(2));
  //This will give us a string representation of the 8 bits that form this current byte;
  //Now we can slice this string to get only the last 7 bits with the payload length:
  console.log(
    "Getting only the bits that represents the payload length:",
    buffer[1].toString(2).slice(1)
  );
  //If we read this as a uint8 we should get the payload length of the message:
  console.log(
    "Converting bits to uint to discover payload length:",
    parseInt(buffer[1].toString(2).slice(1), 2)
  );
}

export function getDecodedMessage(encodedMessage, mask) {
  // the cb here will be called for every byte (elt) within encodedMessage, which can have a
  // length higher than our mask (4), so we use the modulo operator (%) to assure that
  // the index will alway be in the range 0-3
  const decoded = Uint8Array.from(
    encodedMessage,
    (elt, i) => elt ^ mask[i % 4]
  );
  // the ^ is the bitwise operator XOR

  // About the XOR operator:
  // it take the binary representation of two numbers and compare each position from the
  // first number to the same position in the second number, if they are equal return 0
  // else it returns 1;
  //
  // (71).toString(2).padStart(8, '0') -> 01000111
  // (53).toString(2).padStart(8, '0'0 -> 00110101
  // 01000111 ^ 00110101 == 01110010 == 114 (ASCII) == r

  return Buffer.from(decoded).toString("utf-8");
}
