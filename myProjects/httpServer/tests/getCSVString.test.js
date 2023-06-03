const assert = require("assert");
const { describe, it } = require("node:test");
const { CSV_HEADERS } = require("../configs/csvHeaders");
const getCSVString = require("../helpers/getCSVString");

describe("Testing getCSVString function", () => {
  it("Should return a string from the provided object matching the header order", () => {
    const data = {
      id: "1",
      name: "Test",
      phone: "+5511976098818",
    };

    const csvString = getCSVString(data, CSV_HEADERS);

    assert.deepStrictEqual(csvString, "1,Test,+5511976098818\n");
  });

  it("Should only append to the string, the object properties that are present in the header", () => {
    const data = {
      id: "1",
      name: "Test",
      phone: "+5511976098818",
      email: "mlopes.works@gmail.com",
    };

    const csvString = getCSVString(data, CSV_HEADERS);

    assert.deepStrictEqual(csvString, "1,Test,+5511976098818\n");
  });
});
