import { randomUUID, createHash } from "node:crypto";

export class User {
  constructor({ name, email, password }) {
    this.id = randomUUID();
    this.name = name;
    this.email = email;
    this.password = this.#hashPassword(password);
  }

  #hashPassword(password) {
    const hash = createHash("sha256");
    return hash.update(password).digest("hex");
  }
}
