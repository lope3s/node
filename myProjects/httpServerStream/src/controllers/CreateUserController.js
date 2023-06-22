import UserService from "../services/userService.js";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";

class CreateUserController {
  async create(req, res) {
    const transformStream =
      UserService.createUserTransform("./database.ndjson");
    const write = new Writable({
      write(chunk, enc, cb) {
        res.writeHead(201, DEFAULT_HEADERS);
        res.write(chunk);
        res.end();
      },
    });

    await pipeline(req, transformStream, write);
  }
}

export default new CreateUserController();
