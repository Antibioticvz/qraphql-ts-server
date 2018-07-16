import * as Chance from "chance"
import { Connection } from "typeorm"

import { User } from "../../entity/User"
import { invalidLogin, confirmEmailError } from "./errorMessages"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { TestClient } from "../../utils/testClient"

const client = new TestClient(process.env.TEST_HOST as string)

const chance = new Chance()

const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })

let connection: Connection
beforeAll(async () => {
  connection = await createTypeormConn()
})
afterAll(async () => {
  connection.close()
})

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await client.login(e, p)

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  })
}

describe("Login User", async () => {
  it("Reject: Emails or User not found", async () => {
    await loginExpectError(email, password, invalidLogin)
  })

  it("Reject: Register and check unconfirmed user", async () => {
    await client.register(email, password)
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)

    await loginExpectError(email, password, confirmEmailError)
  })

  it("Success: Check confirmed user", async () => {
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)

    await User.update({ email }, { confirmed: true })

    const response = await client.login(email, password)

    expect(response.data).toEqual({ login: null })
  })
})
