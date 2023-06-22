const http = require("node:http");
const { Readable } = require("node:stream");

function* run() {
  for (let i = 0; i < 10; i++) {
    yield {
      id: i,
      name: `Lopes - ${i}`,
    };
  }
}

function handler(req, res) {
  const readable = new Readable({
    async read() {
      for (const data of run()) {
        this.push(JSON.stringify(data) + "\n"); //ndjson format;
      }

      this.push(null);
    },
  });

  readable.pipe(res);
}

const server = http.createServer(handler);

server.listen(3000);
console.log("Listening on 3000");
