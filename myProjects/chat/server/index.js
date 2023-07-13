import { createServer } from "node:net";
import {
  getHeaders,
  createHandShakeHeaders,
  sendMessage,
  howToReadBitsWithinBytes,
  getDecodedMessage,
} from "./utils.js";

// What knowledge i need to understand this project better?
// TypedArrays
// Buffers
// More familiarity on interger sizes

const server = createServer((connection) => {
  connection.on("data", (buffer) => {
    const headers = getHeaders(buffer.toString());
    if (headers) {
      const handShakeHeaders = createHandShakeHeaders(headers);
      connection.write(handShakeHeaders.join(""));
      return;
    }

    howToReadBitsWithinBytes(buffer);

    let bufferOffset = 2;

    let payloadLenght = parseInt(buffer[1].toString(2).slice(1), 2);

    if (payloadLenght == 126) {
      bufferOffset = 4;
      payloadLenght = buffer.subarray(2, bufferOffset).readUint16BE(0);
    }

    //if (payloadLenght == 127) {
    //  bufferOffset = 8;
    //  payloadLenght = buffer.subarray(2, bufferOffset).readBigUInt64BE(0);
    //}

    // as the websocket protocol stats the mask is within the next 32 bits (4 bytes);
    const maskOffset = bufferOffset + 4;

    const mask = buffer.subarray(bufferOffset, maskOffset);

    // the encoded data will be in the bytes left;
    const encodedMessage = buffer.subarray(maskOffset);

    const decodedMessage = getDecodedMessage(encodedMessage, mask);

    console.log("decodedMessage:", decodedMessage, "\n\n");

    const returnMessage = sendMessage(decodedMessage);
    connection.write(returnMessage);
  });
});

server.listen(5001).on("listening", () => console.log("Listening on 5001"));
