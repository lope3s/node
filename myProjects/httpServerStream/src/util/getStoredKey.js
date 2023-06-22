import { readFile } from "node:fs/promises";

export async function getStoredKey(filename) {
  try {
    return await readFile(filename, { encoding: "utf8" });
  } catch (error) {
    console.log(`Error, while reading ${filename},`, error.track);
    return null;
  }
}
