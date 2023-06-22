import { describe, it, after, afterEach, beforeEach, before } from "node:test";
import { promisify } from "node:util";
import assert from "node:assert";
import { server } from "../../index.js";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { User } from "../../entities/user.js";
import { createSign } from "node:crypto";

describe("Testing server routes", () => {
  const serverAddress = "http://localhost:3000";

  const db = "./database.ndjson";

  const fakeUserData = {
    id: "fac291c3-ac3a-45d5-9f92-ace4ccfb457a",
    name: "Luan Lopes",
    email: "mlopes.works@gmail.com",
    password:
      "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
  };

  let validToken;

  before(async () => {
    const pvKey = await readFile("./.private.key");
    const base64Header = Buffer.from(
      JSON.stringify({
        typ: "jwt",
        alg: "sha256",
      })
    ).toString("base64url");

    const base64Payload = Buffer.from(JSON.stringify(fakeUserData)).toString(
      "base64url"
    );

    const sign = createSign("sha256");
    sign.write(`${base64Header}.${base64Payload}`);
    sign.end();

    const signature = sign.sign(pvKey, "base64url");

    validToken = `${base64Header}.${base64Payload}.${signature}`;
  });

  afterEach(async () => await unlink(db));

  after(async () => {
    await Promise.all([
      promisify(server.close.bind(server))(),
      unlink("./.public.key"),
      unlink("./.private.key"),
    ]);
  });

  describe("Testing create user route", () => {
    it("Should create an user, and return the created user id", async () => {
      const userData = {
        name: "Luan Lopes de Faria",
        email: "lopes@mail.com",
        password: "1234",
      };

      const response = await fetch(serverAddress + "/user", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const responseBody = await response.json();

      assert.strictEqual(response.status, 201);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.notEqual(responseBody.id, undefined);
    });
  });

  describe("Testing login route", () => {
    it("Should return a 404 error status if the provided data doesn't match any register in the database", async () => {
      const loginData = {
        email: "mlopes.works@gmail.com",
        password: "12345",
      };

      const response = await fetch(serverAddress + "/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      const responseBody = await response.json();

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, {
        error: "e-mail or password incorrect",
      });
    });

    it("Should return a status 200 with a token containing the data from the user matched in our database", async () => {
      const loginData = {
        email: "mlopes.works@gmail.com",
        password: "1234",
      };
      const user = new User({ name: "Luan Lopes", ...loginData });

      await writeFile(db, JSON.stringify(user) + "\n");

      const response = await fetch(serverAddress + "/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      const responseBody = await response.json();

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.strictEqual(typeof responseBody.token, "string");
    });
  });

  describe("Testing user route", () => {
    beforeEach(
      async () => await writeFile(db, JSON.stringify(fakeUserData) + "\n")
    );

    it("Should not be able to access route if no authorization header is sent", async () => {
      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`);

      const responseBody = await response.json();

      const expectedBody = { error: "Missing Authorization header" };

      assert.strictEqual(response.status, 401);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should return an error 404 if no user is found", async () => {
      const response = await fetch(
        serverAddress + `/user/${fakeUserData.id}asdf`,
        {
          headers: {
            Authorization: validToken,
          },
        }
      );

      const responseBody = await response.json();

      const expectedBody = { error: "User not found." };

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should return the user data that matched with the id sent in the query params, withoud the password field", async () => {
      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      const responseBody = await response.json();

      const { password, ...nonSensibleUserData } = fakeUserData;

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, nonSensibleUserData);
      assert.strictEqual(responseBody.id, nonSensibleUserData.id);
    });
  });

  describe("Testing users route", () => {
    it("Should not be able to access route if no authorization header is sent", async () => {
      const response = await fetch(serverAddress + `/users`);

      const responseBody = await response.json();

      const expectedBody = { error: "Missing Authorization header" };

      assert.strictEqual(response.status, 401);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should return an empty array if there are no users", async () => {
      const response = await fetch(serverAddress + `/users`, {
        headers: {
          Authorization: validToken,
        },
      });

      const responseBody = await response.json();

      const expectedBody = { users: [] };

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should return the users array", async () => {
      await writeFile(db, JSON.stringify(fakeUserData) + "\n");

      const response = await fetch(serverAddress + `/users`, {
        headers: {
          Authorization: validToken,
        },
      });

      const responseBody = await response.json();

      const { password, ...nonSensibleUserData } = fakeUserData;

      const expectedBody = { users: [nonSensibleUserData] };

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });
  });

  describe("testing delete:user route", () => {
    it("Should not be able to access route if no authorization header is sent", async () => {
      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`, {
        method: "DELETE",
      });

      const responseBody = await response.json();

      const expectedBody = { error: "Missing Authorization header" };

      assert.strictEqual(response.status, 401);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should delete user if a match is found", async () => {
      await writeFile(db, JSON.stringify(fakeUserData) + "\n");
      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: validToken,
        },
      });

      assert.strictEqual(response.status, 204);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );

      const databaseContent = await readFile(db, "utf8");

      const ndJSONToJSON = databaseContent.split("\n").slice(0, -1);

      const deletedUser = ndJSONToJSON.find(
        (user) => user.id === fakeUserData.id
      );

      assert.strictEqual(deletedUser, undefined);
    });
  });

  describe("Testing updateUser route", () => {
    it("Should not be able to access route if no authorization header is sent", async () => {
      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`, {
        method: "PUT",
      });

      const responseBody = await response.json();

      const expectedBody = { error: "Missing Authorization header" };

      assert.strictEqual(response.status, 401);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );
      assert.deepStrictEqual(responseBody, expectedBody);
    });

    it("Should return the updatedUserId in if the user is successfuly updated", async () => {
      await writeFile(db, JSON.stringify(fakeUserData) + "\n");

      const requestBody = {
        name: "us0p",
      };

      const response = await fetch(serverAddress + `/user/${fakeUserData.id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: validToken,
        },
      });

      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(
        response.headers.get("content-type"),
        "application/json"
      );

      assert.deepStrictEqual(body, { id: fakeUserData.id });

      const databaseContent = await readFile(db, "utf8");

      const updatedUser = JSON.parse(databaseContent.replace("\n", ""));

      assert.strictEqual(updatedUser.name, requestBody.name);
    });
  });
});
