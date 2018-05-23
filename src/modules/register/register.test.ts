import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";

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
    register(email: "${email}", password: "${pasword}"){
      path
      message
    }
}
`;

test("Register User Success", async () => {
  const res: any = await request(getHost, mutation);
  expect(res).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pasword);
});

test("Register User Reject", async () => {
  const res: any = await request(getHost, mutation);
  expect(res.register).toHaveLength(1);
  expect(res.register[0].path).toEqual("email");
  expect(res.register[0].message).toEqual("already taken");
  /* expect(res).toEqual({
    register: [
      {
        path: "email",
        message: "already taken"
      }
    ]
  }); */

  /* const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(pasword); */
});
