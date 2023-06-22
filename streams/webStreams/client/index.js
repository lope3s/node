const API_URL = "http://localhost:3000";

async function consumeAPI(signal) {
  const response = await fetch(API_URL, {
    signal,
  });

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(parseNDJSON());
  return reader;
}

function parseNDJSON() {
  let ndjsonBufer = "";
  return new TransformStream({
    transform(chunk, controller) {
      ndjsonBufer += chunk;
      const items = ndjsonBufer.split("\n");
      items
        .slice(0, -1)
        .forEach((item) => controller.enqueue(JSON.parse(item)));
      ndjsonBufer = items[items.length - 1];
    },
    flush(controller) {
      if (!ndjsonBufer) return;
      controller.enqueue(JSON.parse(ndjsonBufer));
    },
  });
}

function appendHTML(element) {
  return new WritableStream({
    write({ title, description, url_anime }) {
      const card = `
            <article>
                <div class='text'>
                <h3>${title}</h3>
                <p>${description.slice(0, 100)}</p>
                <a href=${url_anime}> Here's why</a>
                </div>
            </article>
      `;
      element.innerHTML += card;
    },
    abort(reason) {
      console.log("Aborted", reason);
    },
  });
}

const [start, stop, cards] = ["start", "stop", "cards"].map((item) =>
  document.getElementById(item)
);

let abortController = new AbortController();

start.addEventListener("click", async () => {
  const readable = await consumeAPI(abortController.signal);
  readable.pipeTo(appendHTML(cards));
});

stop.addEventListener("click", () => {
  abortController.abort();
  console.log("Aborting...");
  abortController = new AbortController();
});
