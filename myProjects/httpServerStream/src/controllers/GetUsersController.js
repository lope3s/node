import UserService from "../services/userService.js";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { Writable } from "node:stream";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";

class GetUsersController {
  async index(req, res) {
    const readable = createInterface({
      input: createReadStream("./database.ndjson", { flags: "a+" }),
      crlfDelay: Infinity,
    });

    const getUsersTransform = UserService.getUsers();

    const users = [];

    const writable = new Writable({
      write(chunk, enc, cb) {
        users.push(JSON.parse(chunk));
        cb();
      },
    });

    await pipeline(readable, getUsersTransform, writable);

    res.writeHead(200, DEFAULT_HEADERS);
    res.write(JSON.stringify({ users }));
    res.end();
  }
}

export default new GetUsersController();
