import { DEFAULT_HEADERS, getStoredKey, verifyJWT } from "../util/index.js";

export function authMiddleware(cb) {
  return async (req, res) => {
    const token = req.headers["authorization"];
    const publicKey = await getStoredKey("./.public.key");

    if (!token) {
      res.writeHead(401, DEFAULT_HEADERS);
      res.write(JSON.stringify({ error: "Missing Authorization header" }));
      res.end();
      return;
    }

    const isTokenValid = verifyJWT(publicKey, token);

    if (!isTokenValid.valid) {
      res.writeHead(401, DEFAULT_HEADERS);
      res.write(JSON.stringify({ error: isTokenValid.error }));
      res.end();
      return;
    }

    return cb(req, res);
  };
}
