const socket = new WebSocket("ws://localhost:5001");

const personalizedEvent = { event: "test" };

socket.addEventListener("open", (event) => {
  console.log("socket connected");
  socket.send("hello, world");
});

socket.addEventListener("message", (message) => {
  console.log("message:", message);
});
