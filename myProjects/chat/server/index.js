import { createServer } from "node:net";

// Chat:
// The goal of this project is to:
// Practice TDD;
// Understand how Node Net module works and how to work with sockets;
// Further learning in streams;

const server = createServer((connection) => {
  //console.log("connected: ", connection); // connection information;
  //const testHeader = [
  //  "HTTP/1.1 101 Switching Protocols",
  //  "Upgrade: websocket",
  //  "Connection: Upgrade",
  //];
  //connection.write(testHeader.map((line) => line.concat("\r\n")).join(""));
  //connection.pipe(connection);
  //connection.on("data", (data) => {
  //  //const headers = data.toString().replace(/\r/g, "").split("\n");
  //  console.log(data.toString());
  //});
  //connection.pipe(connection); //writing back to the connection;
  connection.on("data", (data) => {
    const [header, body] = data.toString().split(/^\n$/);
    console.log(header);
    console.log(body);

    const enhanceBody = JSON.parse(body);
    enhanceBody.result = "success";

    connection.write(JSON.stringify(enhanceBody));
  });
});

server.listen(5001).on("listening", () => console.log("Listening on 5001"));
