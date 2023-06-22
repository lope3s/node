const { Transform } = require("node:stream");

process.stdin
  .pipe(
    new Transform({
      transform(chunk, encoding, cb) {
        const strToInt = parseInt(chunk.toString().replace("\n", ""));

        cb(null, `${strToInt + 5}\n`);
      },
    })
  )
  .pipe(process.stdout);
