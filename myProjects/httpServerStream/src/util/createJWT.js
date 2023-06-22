import { createSign } from "node:crypto";
import { encodeString } from "./encodeString.js";

export function createJWT(privateKey, payload) {
  const header = {
    alg: "SHA256",
    typ: "JWT",
  };

  //Here we create a base64 string from the provided JSON and tidy it accordingly to RFC4648;
  const encodedHeader = encodeString(JSON.stringify(header), "base64url");
  const encodedPayload = encodeString(JSON.stringify(payload), "base64url");

  const sign = createSign(header.alg);
  sign.write(`${encodedHeader}.${encodedPayload}`);
  sign.end();

  const signature = sign.sign(privateKey, "base64url");

  //return string in JWT pattern: header.payload.signature
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
