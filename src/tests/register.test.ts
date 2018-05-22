import { request } from "graphql-request";

import { User } from "../entity/User";
import { startServer } from "../startServer";

let getHost = "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address();
  getHost = `http://127.0.0.1:${port}`;
});

// const host = "http://localhost:4000/";

const email = "info@bob.com";
const pasword = "test";

const mutation = `
mutation {
    register(email: "${email}", password: "${pasword}")
}
`;

test("Rgister User", async () => {
  const res = await request(getHost, mutation);
  expect(res).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pasword);
});
