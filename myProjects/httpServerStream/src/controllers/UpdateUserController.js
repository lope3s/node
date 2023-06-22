import UserService from "../services/userService.js";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";

class UpdateUserController {
  async update(req, res) {
    const updateUserTransform = UserService.updateUser(
      req.params.id,
      "./database.ndjson"
    );

    let updatedId;

    const writable = new Writable({
      write(chunk, enc, cb) {
        updatedId = { id: chunk.toString() };
        cb();
      },
    });

    await pipeline(req, updateUserTransform, writable);

    res.writeHead(200, DEFAULT_HEADERS);
    res.write(JSON.stringify(updatedId));
    res.end();
  }
}

export default new UpdateUserController();
