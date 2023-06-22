import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import UserService from "../services/userService.js";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";

class DeleteUserController {
  async delete(req, res) {
    const deleteUserTransform = UserService.deleteUser(req.params.id);

    const readable = createInterface({
      input: createReadStream("./database.ndjson"),
      crlfDelay: Infinity,
    });

    const writable = new Writable({
      write(chunk, enc, cb) {
        newDbData.push(chunk.toString() + "\n");
        cb();
      },
    });

    const newDbData = [];

    await pipeline(readable, deleteUserTransform, writable);

    for (const index in newDbData) {
      const user = newDbData[index];
      if (index === "0") {
        await writeFile("./database.ndjson", user);
        continue;
      }
      await writeFile("./database.ndjson", user, { flag: "a" });
    }

    res.writeHead(204, DEFAULT_HEADERS);
    res.end();
  }
}

export default new DeleteUserController();
