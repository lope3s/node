import { createVerify } from "node:crypto";

export function verifyJWT(publicKey, tokenJWT) {
  const [header, payload, signature] = tokenJWT.split(".");
  try {
    const { alg, typ } = JSON.parse(atob(header));

    if (typ?.toLowerCase() !== "jwt") {
      return { valid: false, error: "Header typ property is not JWT" };
    }

    if (!alg) {
      return {
        valid: false,
        error: "Invalid token header, missing alg property",
      };
    }

    const verify = createVerify(alg);
    verify.write(`${header}.${payload}`);
    verify.end();

    const isValid = verify.verify(publicKey, signature, "base64url");

    if (!isValid) return { valid: false, error: "Invalid token" };

    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.name };
  }
}
