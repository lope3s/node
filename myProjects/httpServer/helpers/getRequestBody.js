async function getRequestBody(request) {
  const { headers } = request;
  const content = headers["content-type"];
  let body = [];

  return new Promise((res, rej) => {
    request
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        if (content === "application/json") {
          body = JSON.parse(Buffer.concat(body).toString());
        }

        res(body);
      })
      .on("error", (err) => rej(err));
  });
}

module.exports = getRequestBody;
