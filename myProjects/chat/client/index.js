const socket = new WebSocket("ws://localhost:5001");

const personalizedEvent = { event: "test" };

socket.addEventListener("open", (event) => {
  socket.send(JSON.stringify(personalizedEvent));
});

socket.addEventListener("message", (message) => {
  console.log("message:", message);
});
