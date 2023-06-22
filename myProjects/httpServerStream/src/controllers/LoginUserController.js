import { Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import UserService from "../services/userService.js";
import { DEFAULT_HEADERS } from "../util/defaultHeaders.js";
import { hashString, createJWT, getStoredKey } from "../util/index.js";

class LoginUserController {
  async login(req, res) {
    const transform = UserService.getUser("./database.ndjson");
    const privateKey = await getStoredKey("./.private.key");

    let result = { err: false, value: null };

    const write = new Writable({
      async write(chunk, enc, cb) {
        if (!JSON.parse(chunk)) {
          result.err = true;
          result.value = JSON.stringify({
            error: "e-mail or password incorrect",
          });
          return cb();
        }
        result.err = false;
        const token = createJWT(privateKey, JSON.parse(chunk));
        result.value = JSON.stringify({ token });
        cb();
      },
    });

    const t = new Transform({
      transform(chunk, enc, cb) {
        const loginData = JSON.parse(chunk);

        loginData.password = hashString(loginData.password);

        cb(null, Buffer.from(JSON.stringify(loginData)));
      },
    });

    await pipeline(req, t, transform, write);

    if (result.err) res.writeHead(404, DEFAULT_HEADERS);
    if (!result.err) res.writeHead(200, DEFAULT_HEADERS);
    res.write(result.value);
    res.end();
  }
}

export default new LoginUserController();
