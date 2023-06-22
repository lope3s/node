import { generateKeyPairSync } from "node:crypto";
import { writeFile, readFile } from "node:fs/promises";

export async function createKeys(keysFilenameObj) {
  const generatedKeys = generateKeyPairSync("ec", {
    namedCurve: "sect239k1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  try {
    for (const key in keysFilenameObj) {
      const filename = keysFilenameObj[key];
      const fileContent = await readFile(filename);
      if (fileContent.length) continue;
      await writeFile(filename, generatedKeys[key]);
    }
  } catch (error) {
    for (const key in keysFilenameObj) {
      const filename = keysFilenameObj[key];
      await writeFile(filename, generatedKeys[key]);
    }
  }
}
