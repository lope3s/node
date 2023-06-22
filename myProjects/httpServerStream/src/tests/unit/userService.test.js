import { describe, it, afterEach, beforeEach } from "node:test";
import assert from "node:assert";
import UserService from "../../services/userService.js";
import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { unlink } from "node:fs/promises";
import { writeFile, open } from "node:fs/promises";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { hashString } from "../../util/hashString.js";

describe("Testing userService", async () => {
  const fakeDb = "./database-fake.ndjson";
  const data =
    '{"id":"836f85d7-8a45-4116-a156-d2da99267049","name":"Luan Lopes","email":"mlopes.works@gmail.com","password":"03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"}\n';

  const fakeData = [
    {
      id: "48f318da-6277-4a0d-83af-d34e7c3484c2",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
    {
      id: "eb1f5e5d-3a3c-4f28-a70b-9462021befd8",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
    {
      id: "4a006371-6ab9-4482-be2b-7c37e37b328d",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
    {
      id: "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
    {
      id: "4b031b6b-5b37-4b8c-a72a-86a18e28ba9f",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
    {
      id: "28b6c175-2726-4a45-9da0-306b8a09d936",
      name: "Luan Lopes",
      email: "mlopes.works@gmail.com",
      password:
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    },
  ];

  afterEach(async () => {
    try {
      await unlink(fakeDb);
    } catch (error) {}
  });

  describe("Testing createUserTransform method", () => {
    it("Should return a transform stream that will add request data to the database and add write the created id to the stream", async () => {
      const req = {
        name: "Luan Lopes",
        email: "teste.lopes@mail.com",
        password: "1234",
      };
      let res;

      const transform = UserService.createUserTransform(fakeDb);

      const read = Readable({
        read() {
          this.push(JSON.stringify(req));
          this.push(null);
        },
      });

      const write = Writable({
        write(chunk, enc, cb) {
          const obj = JSON.parse(chunk);
          res = obj;
          cb();
        },
      });

      await pipeline(read, transform, write);

      assert.notEqual(res.id, undefined);
    });
  });

  describe("Tesing getUser method", () => {
    it("Should return 'null' if the user was not found", async () => {
      const file = await open(fakeDb, "w");
      const transformReq = UserService.getUser(fakeDb);

      const readable = new Readable({
        read() {
          this.push(data);
          this.push(null);
        },
      });

      let result;

      const writable = new Writable({
        write(chunk, enc, cb) {
          result = chunk.toString();
          cb();
        },
      });

      await pipeline(readable, transformReq, writable);

      await file.close();
      assert.strictEqual(result, "null");
    });

    it("Sould return a JSON with the user data excluding the password if there's a match", async () => {
      await writeFile(fakeDb, data);
      const transformReq = UserService.getUser(fakeDb);

      const readable = new Readable({
        read() {
          this.push(data);
          this.push(null);
        },
      });

      let result;

      const writable = new Writable({
        write(chunk, enc, cb) {
          result = JSON.parse(chunk);
          cb();
        },
      });

      await pipeline(readable, transformReq, writable);

      const { password, ...expected } = JSON.parse(data.replace("\n", ""));

      assert.deepStrictEqual(result, expected);
    });
  });

  describe("Testing getUsers method", () => {
    it("Should return a list containing all the users added until now", async () => {
      await writeFile(fakeDb, data);
      const getNotSensibleUserDataTransform = UserService.getUsers(fakeDb);

      const readable = createInterface({
        input: createReadStream(fakeDb),
        crlfDelay: Infinity,
      });

      const dbData = [];

      const writable = new Writable({
        write(chunk, enc, cb) {
          dbData.push(JSON.parse(chunk));
          cb();
        },
      });

      await pipeline(readable, getNotSensibleUserDataTransform, writable);

      const { password, ...notSensibleUserData } = JSON.parse(
        data.replace("\n", "")
      );

      assert.deepStrictEqual([notSensibleUserData], dbData);
    });
  });

  describe("Testing deleteUser method", () => {
    it("Should populate the writable part only with data that doesn't match with the provided ID", async () => {
      const idToDelete = "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2";

      const deleteUserTransform = UserService.deleteUser(
        "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2"
      );

      const updatedDb = [];

      const writable = new Writable({
        write(chunk, enc, cb) {
          updatedDb.push(JSON.parse(chunk));
          cb();
        },
      });

      function* dataSource() {
        for (const data of fakeData) {
          yield JSON.stringify(data) + "\n";
        }
      }

      await pipeline(dataSource, deleteUserTransform, writable);

      const deletedUser = updatedDb.find((user) => user.id === idToDelete);

      assert.strictEqual(deletedUser, undefined);
    });
  });

  describe("Testing updateUser method", () => {
    beforeEach(async () => {
      await writeFile(fakeDb, JSON.stringify(fakeData[0]) + "\n");
      for (const data of fakeData.slice(1, -1)) {
        await writeFile(fakeDb, JSON.stringify(data) + "\n", { flag: "a" });
      }
    });

    it("Should update the correct user in the db", async () => {
      const idToUpdate = "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2";

      const dataToUpdate = {
        name: "us0p",
        email: "us0p@mail.com",
      };

      const updateUserTransform = UserService.updateUser(idToUpdate, fakeDb);

      const req = new Readable({
        read() {
          this.push(JSON.stringify(dataToUpdate));
          this.push(null);
        },
      });

      let updatedId;

      const res = new Writable({
        write(chunk, enc, cb) {
          updatedId = chunk.toString();
          cb();
        },
      });

      await pipeline(req, updateUserTransform, res);

      const updatedDb = [];

      const readline = createInterface({
        input: createReadStream(fakeDb),
        crlfDelay: Infinity,
      });

      const writable = new Writable({
        write(chunk, env, cb) {
          updatedDb.push(JSON.parse(chunk.toString().replace("\n", "")));
          cb();
        },
      });

      await pipeline(readline, writable);

      assert.strictEqual(updatedId, idToUpdate);

      const updatedUser = updatedDb.find((user) => user.id === updatedId);

      for (const key in dataToUpdate) {
        const data = dataToUpdate[key];
        const updatedUserData = updatedUser[key];

        assert.strictEqual(data, updatedUserData);
      }
    });

    it("Should update the password correctly if it's present in the req.body", async () => {
      const idToUpdate = "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2";

      const dataToUpdate = {
        password: "4321",
      };

      const updateUserTransform = UserService.updateUser(idToUpdate, fakeDb);

      const req = new Readable({
        read() {
          this.push(JSON.stringify(dataToUpdate));
          this.push(null);
        },
      });

      let updatedId;

      const res = new Writable({
        write(chunk, enc, cb) {
          updatedId = chunk.toString();
          cb();
        },
      });

      await pipeline(req, updateUserTransform, res);

      const updatedDb = [];

      const readline = createInterface({
        input: createReadStream(fakeDb),
        crlfDelay: Infinity,
      });

      const writable = new Writable({
        write(chunk, env, cb) {
          updatedDb.push(JSON.parse(chunk.toString().replace("\n", "")));
          cb();
        },
      });

      await pipeline(readline, writable);

      assert.strictEqual(updatedId, idToUpdate);

      const updatedUser = updatedDb.find((user) => user.id === updatedId);

      assert.strictEqual(
        updatedUser.password,
        hashString(dataToUpdate.password)
      );
    });

    it("Should not insert data that don't belongs to the User entity", async () => {
      const idToUpdate = "e2ac4fc8-5a64-41f5-bd52-94ba9c7455d2";

      const dataToUpdate = {
        phone: "123456789",
      };

      const updateUserTransform = UserService.updateUser(idToUpdate, fakeDb);

      const req = new Readable({
        read() {
          this.push(JSON.stringify(dataToUpdate));
          this.push(null);
        },
      });

      let updatedId;

      const res = new Writable({
        write(chunk, enc, cb) {
          updatedId = chunk.toString();
          cb();
        },
      });

      await pipeline(req, updateUserTransform, res);

      const updatedDb = [];

      const readline = createInterface({
        input: createReadStream(fakeDb),
        crlfDelay: Infinity,
      });

      const writable = new Writable({
        write(chunk, env, cb) {
          updatedDb.push(JSON.parse(chunk.toString().replace("\n", "")));
          cb();
        },
      });

      await pipeline(readline, writable);

      assert.strictEqual(updatedId, idToUpdate);

      const updatedUser = updatedDb.find((user) => user.id === updatedId);

      assert.strictEqual(updatedUser.phone, undefined);
    });
  });
});
