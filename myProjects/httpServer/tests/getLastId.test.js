const assert = require("assert");
const { unlink, open } = require("fs/promises");
const { describe, after, it } = require("node:test");
const { FILE_PATH } = require("../configs/csvHeaders");
const getLastId = require("../helpers/getLastId");
const readCSVFile = require("../helpers/readCSVFile");

describe("Testing getLastId function", () => {
  after(async () => await unlink(FILE_PATH));

  it("Should return an ID 0 for an empty file", async () => {
    const lastId = await getLastId();

    assert.deepStrictEqual(lastId, 0);
  });

  it("Should return the last ID of the file", async () => {
    const file = await open(FILE_PATH, "a");
    await file.appendFile("1,Test,+5511976098818\n");

    const realLastId = await readCSVFile();

    const lastId = await getLastId();

    assert.deepStrictEqual(lastId, parseInt(realLastId.at(-1)["id"]));
  });
});
