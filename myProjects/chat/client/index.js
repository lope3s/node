const socket = new WebSocket("ws://localhost:5001");

const personalizedEvent = {
  event:
    "test asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdftest asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf",
};

socket.addEventListener("open", (event) => {
  console.log("socket connected");
  socket.send(JSON.stringify(personalizedEvent));
});

socket.addEventListener("message", (message) => {
  console.log("message:", message);
});
