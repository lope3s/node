export function encodeString(JSON, encoding) {
  return Buffer.from(JSON).toString(encoding);
}
