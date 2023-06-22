const { WritableStream } = require("node:stream/web");

function parseNDJSON() {
  let ndjsonBufer = "";
  return new TransformStream({
    //Called when a chunk written to the writable side is ready to be transformed, and performs the work of the transformation stream.
    transform(chunk, controller) {
      ndjsonBufer += chunk;

      const items = ndjsonBufer.split("\n");
      items
        .slice(0, -1) //Generates a coppy of the awway with all elements in the array excluding the last;
        .forEach((item) => controller.enqueue(JSON.parse(item)));

      //When we split the string in the \n we will receive a collection of JSON with the last item being an empty string;
      ndjsonBufer = items[items.length - 1]; //Here we are assigning the empty last value to the variable, reseting it
    },
    //Called after all chunks written to the writable side have been successfully transformed, and the writable side is about to be closed.
    flush(controller) {
      if (!ndjsonBufer) return;
      controller.enqueue(JSON.parse(ndjsonBufer));
    },
  });
}

(async () => {
  const response = await fetch("http://localhost:3000");
  response.body
    .pipeThrough(new TextDecoderStream()) //Converts a stream of text in a binary encoding, such as UTF-8 etc., to a stream of strings.
    .pipeThrough(parseNDJSON())
    .pipeTo(
      new WritableStream({
        write(sink) {
          console.log("Received", sink);
        },
      })
    );
})();
