import * as Redis from "ioredis";

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";
import fetch from "node-fetch";

const redis = new Redis();
let userId = "";

beforeAll(async () => {
  await createTypeormConn();
  const user = await User.create({
    email: "nnn@nnn.nn",
    password: "dfdfdfdfdfdf"
  }).save();
  userId = user.id;
});

describe("createConfirmEmailLink", async () => {
  it("Success: User was created and is deleted from redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    );

    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();
    // be sure that we remowe the redis id
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const keyVal = await redis.get(key);
    expect(keyVal).toBeNull();
  });
});
