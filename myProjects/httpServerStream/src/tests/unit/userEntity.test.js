import { User } from "../../entities/user.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import { createHash } from "node:crypto";

describe("Testing User entity", () => {
  it("Should add an id and hash the provided password", () => {
    const userData = {
      name: "Luan Lopes",
      email: "test@mail.com",
      password: "1234",
    };

    const { id, ...rest } = new User(userData);

    const hash = createHash("sha256");
    const hashedPass = hash.update(userData.password).digest("hex");

    assert.notEqual(id, undefined);
    assert.deepStrictEqual(rest, { ...userData, password: hashedPass });
  });
});
