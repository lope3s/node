import { createHash } from "node:crypto";

export function hashString(string) {
  const hash = createHash("sha256");

  return hash.update(string).digest("hex");
}
