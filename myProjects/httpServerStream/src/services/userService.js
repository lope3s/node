import { User } from "../entities/user.js";
import { Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { hashString } from "../util/hashString.js";

class UserService {
  createUserTransform(filename) {
    const transform = new Transform({
      transform(chunk, enc, cb) {
        try {
          const chunkToJSON = chunk.toString();
          const user = new User(JSON.parse(chunkToJSON));
          const userStringfied = JSON.stringify(user);
          writeFileSync(filename, `${userStringfied}\n`, { flag: "a" });
          cb(null, JSON.stringify({ id: user.id }));
        } catch (error) {
          cb(error);
        }
      },
    });

    return transform;
  }

  getUser(filename) {
    const transform = new Transform({
      async transform(chunk, enc, cb) {
        const userData = JSON.parse(chunk);

        const controller = new AbortController();

        let user;

        const writable = new Writable({
          write(chunk, enc, cb) {
            const dbData = JSON.parse(chunk);
            for (const key in userData) {
              if (userData[key] !== dbData[key]) return cb();
            }
            user = dbData;
            controller.abort();
          },
        });

        const readline = createInterface({
          input: createReadStream(filename, { flags: "a+" }),
          crlfDelay: Infinity,
        });
        try {
          await pipeline(readline, writable, {
            signal: controller.signal,
          });

          cb(null, "null");
        } catch (error) {
          if (error.name === "AbortError") {
            return cb(
              null,
              JSON.stringify({
                name: user.name,
                email: user.email,
                id: user.id,
              })
            );
          }
          console.log(error);
          cb(error);
        }
      },
    });

    return transform;
  }

  getUsers() {
    return new Transform({
      transform(chunk, enc, cb) {
        const chunkToString = chunk.toString().replace("\n", "");
        const stringToObj = JSON.parse(chunkToString);
        const { password, ...nonSensibleUserData } = stringToObj;
        cb(null, JSON.stringify(nonSensibleUserData));
      },
    });
  }

  deleteUser(userID) {
    return new Transform({
      transform(chunk, enc, cb) {
        const userData = JSON.parse(chunk.toString().replace("\n", ""));

        if (userData.id !== userID) {
          return cb(null, chunk);
        }
        cb();
      },
    });
  }

  updateUser(userID, filename) {
    return new Transform({
      async transform(reqChunk, enc, cb) {
        const reqUserData = JSON.parse(reqChunk);

        const databaseStream = createInterface({
          input: createReadStream(filename),
          crlfDelay: Infinity,
        });

        let updatedId;

        const updateDbStream = new Writable({
          write(dbChunk, enc, cb) {
            let dbUser = JSON.parse(dbChunk.toString().replace("\n", ""));

            if (dbUser.id === userID) {
              updatedId = dbUser.id;
              for (const key of Object.keys(dbUser)) {
                if (key !== "password" && reqUserData[key]) {
                  dbUser[key] = reqUserData[key];
                  continue;
                }

                if (reqUserData[key]) {
                  const hashedPass = hashString(reqUserData[key]);
                  dbUser[key] = hashedPass;
                }
              }
            }
            updatedDb.push(dbUser);
            cb();
          },
        });

        const updatedDb = [];

        function* generateNewDbData() {
          for (const user of updatedDb) {
            yield JSON.stringify(user) + "\n";
          }
        }
        try {
          await pipeline(databaseStream, updateDbStream);

          await pipeline(generateNewDbData, createWriteStream(filename));

          cb(null, updatedId);
        } catch (error) {
          cb(error);
        }
      },
    });
  }
}

export default new UserService();
