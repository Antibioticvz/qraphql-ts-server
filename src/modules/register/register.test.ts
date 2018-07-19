import * as Chance from "chance"
import { User } from "../../entity/User"
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import { TestClient } from "../../utils/testClient"

const client = new TestClient(process.env.TEST_HOST as string)

const chance = new Chance()

const email = chance.email({ domain: "gmail.com", length: 10 })
const emailToShort = chance.email({ domain: "d.io", length: 1 })
const password = chance.string({ length: 10 })
const passwordToShort = chance.string({ length: 2 })
const justString = chance.string({ length: 10 })
const justShortString = chance.string({ length: 1 })

let connection: Connection
beforeAll(async () => {
  connection = await createTypeormConn()
})
afterAll(async () => {
  connection.close()
})

describe("Register User", async () => {
  it("Success: make sure we can register a user", async () => {
    const response = await client.register(email, password)
    expect(response.data).toEqual({ register: null })

    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)

    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)
  })

  it("Reject: test for duplicate emails", async () => {
    const response = await client.register(email, password)
    expect(response.data.register).toHaveLength(1)
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    })
  })

  it("Reject: bad emails without @", async () => {
    const response = await client.register(justString, password)
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: invalidEmail
    })
  })

  it("Reject: Emails too short", async () => {
    const response = await client.register(emailToShort, password)
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough
    })
  })

  it("Reject: Emails too short", async () => {
    const response = await client.register(email, passwordToShort)
    expect(response.data.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    })
  })

  it("Reject: Bad password and bad email", async () => {
    const response = await client.register(justShortString, passwordToShort)

    expect(response.data.register).toEqual([
      {
        path: "email",
        message: "email must be at least 7 characters"
      },
      { path: "email", message: "email must be a valid email" },
      {
        path: "password",
        message: "password must be at least 5 characters"
      }
    ])
  })
})
