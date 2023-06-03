const assert = require("node:assert");
const getFile = require("../helpers/getFile");
const { unlink, open } = require("node:fs/promises");
const { describe, it, afterEach } = require("node:test");
const { CSV_HEADERS, FILE_PATH } = require("../configs/csvHeaders");

describe("Testing getFile Function", async () => {
  afterEach(async () => await unlink(FILE_PATH));

  it("Should create a file and return it if don't exist", async () => {
    //Assuring that the file doesn't exists
    try {
      await unlink(FILE_PATH);
    } catch (error) {}

    const file = await getFile();

    assert.notDeepStrictEqual(file, undefined);
    await file.close();
  });

  it("Should create the file with the proper headers", async () => {
    //Will retrutn a brand new file, only with the headers
    const file = await getFile();
    const fileData = await file.readFile({ encoding: "utf8" });
    assert.deepStrictEqual(
      fileData.replaceAll("\n", "").split(","),
      CSV_HEADERS
    );
    await file.close();
  });

  it("Should return the file if it exists", async () => {
    //Will retrutn a brand new file, only with the headers
    await getFile();
    const file = await open(FILE_PATH, "a");
    await file.appendFile("1,Test Contact,+5511976098818\n");
    await file.close();

    //Should return the same file with the header and the added data
    const updatedFile = await getFile();

    const expected = "id,name,phone\n1,Test Contact,+5511976098818\n";

    const actual = await updatedFile.readFile({ encoding: "utf8" });

    assert.deepStrictEqual(actual, expected);
    await updatedFile.close();
  });
});
