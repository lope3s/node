import { createServer } from "node:http";
import {
  getQuery,
  matchRoutes,
  DEFAULT_HEADERS,
  createKeys,
} from "./util/index.js";
import { routes } from "./routes.js";

const URL_BASE = "http://localhost:3000";

async function handler(req, res) {
  const { method, url } = req;

  const urlObj = new URL(url, URL_BASE);

  req.query = getQuery(urlObj.searchParams);

  const methodPathname = `${method.toLowerCase()}:${urlObj.pathname}`;

  try {
    await matchRoutes(req, res, routes, methodPathname);
  } catch (error) {
    console.log(error);
    res.writeHead(500, DEFAULT_HEADERS);
    res.write(JSON.stringify({ error: "Internal Server Error" }));
    res.end();
  }
}

await createKeys({ publicKey: "./.public.key", privateKey: "./.private.key" });

const server = createServer(handler);

server
  .listen(3000)
  .on("listening", () => console.log("Listening on port 3000"));

export { server };
