import * as Chance from "chance";
import { request } from "graphql-request";
import { User } from "../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeormConn } from "../../utils/createTypeormConn";

const chance = new Chance();

const email = chance.email({ domain: "gmail.com", length: 10 });
const emailToShort = chance.email({ domain: "d.io", length: 1 });
const password = chance.string({ length: 10 });
const passwordToShort = chance.string({ length: 2 });
const justString = chance.string({ length: 10 });
const justShortString = chance.string({ length: 1 });

const mutation = (e: string, p: string) => `
mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
}
`;

beforeAll(async () => {
  await createTypeormConn();
});

describe("Register User", async () => {
  it("Success: make sure we can register a user", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(res).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it("Reject: test for duplicate emails", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(res.register).toHaveLength(1);
    expect(res.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("Reject: bad emails without @", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(justString, password)
    );
    expect(res.register[0]).toEqual({
      path: "email",
      message: invalidEmail
    });
  });

  it("Reject: Emails too short", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(emailToShort, password)
    );
    expect(res.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough
    });
  });

  it("Reject: Emails too short", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, passwordToShort)
    );
    expect(res.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    });
  });

  it("Reject: Bad password and bad email", async () => {
    const res: any = await request(
      process.env.TEST_HOST as string,
      mutation(justShortString, passwordToShort)
    );
    expect(res.register).toEqual([
      {
        path: "email",
        message: "email must be at least 7 characters"
      },
      { path: "email", message: "email must be a valid email" },
      {
        path: "password",
        message: "password must be at least 5 characters"
      }
    ]);
  });
});
