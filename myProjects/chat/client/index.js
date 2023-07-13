const socket = new WebSocket("ws://localhost:5001");

let count = 0;

const personalizedEvent = {
  event: "test",
  count,
  event2: "test",
  event3: "test",
  event4: "test",
  event5: "testr",
  event6: "testr",
  event7: "testrr",
};

socket.addEventListener("open", (event) => {
  console.log("socket connected");
  socket.send(JSON.stringify(personalizedEvent));
});

socket.addEventListener("message", (message) => {
  console.log("message:", message);
});

const button = document.getElementById("button");

button.addEventListener("click", () => {
  socket.send(JSON.stringify({ ...personalizedEvent, count }));
  count++;
});
