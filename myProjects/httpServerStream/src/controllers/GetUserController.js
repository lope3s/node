import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import UserService from "../services/userService.js";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";

class GetUserController {
  async show(req, res) {
    const resState = { value: null, err: true };

    const transform = UserService.getUser("./database.ndjson");

    const readable = new Readable({
      read() {
        this.push(JSON.stringify(req.params));
        this.push(null);
      },
    });

    const writable = new Writable({
      write(chunk, enc, cb) {
        if (chunk.toString() === "null") {
          resState.value = JSON.stringify({
            error: "User not found.",
          });
          return cb();
        }
        resState.err = false;
        resState.value = chunk;
        cb();
      },
    });

    await pipeline(readable, transform, writable);

    if (resState.err) res.writeHead(404, DEFAULT_HEADERS);
    if (!resState.err) res.writeHead(200, DEFAULT_HEADERS);
    res.write(resState.value);
    res.end();
  }
}

export default new GetUserController();
