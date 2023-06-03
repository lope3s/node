const { describe, it, before, after } = require("node:test");
const readCSVFile = require("../helpers/readCSVFile");
const getFile = require("../helpers/getFile");
const { open, unlink } = require("fs/promises");
const { FILE_PATH } = require("../configs/csvHeaders");
const assert = require("assert");

describe("Testing readCSVFile function", () => {
  before(async () => {
    const file = await getFile();
    await file.close();

    const fileA = await open(FILE_PATH, "a");
    await fileA.appendFile("1,Test,+5511976098818\n");
    await fileA.close();
  });

  after(async () => await unlink(FILE_PATH));

  it("Should read the file and return an Array with objects with the same structure as the csv header", async () => {
    const fileData = await readCSVFile();

    const expected = [
      {
        id: "1",
        name: "Test",
        phone: "+5511976098818",
      },
    ];

    assert.deepStrictEqual(fileData, expected);
  });

  it("Should return an empty Array if there's no content in the csv", async () => {
    await unlink(FILE_PATH);

    const fileData = await readCSVFile();

    assert.deepStrictEqual(fileData, []);
  });
});
