import axios from "axios"
import * as Chance from "chance"
import { User } from "../../entity/User"

import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import async from "./middleware"

const chance = new Chance()

const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })

const mutation = (e: string, p: string) => `
mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
}
`

let connection: Connection
beforeAll(async () => {
  connection = await createTypeormConn()
})
afterAll(async () => {
  connection.close()
})

describe("Me from cooki", async () => {
  it("Reject: can't get user if not logged in", async () => {
    // later
  })

  it("", async () => {
    // later
  })
})

describe("Register User", async () => {
  it("c make sure we can register a user", async () => {
    const res = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(res).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)
  })

  it("Reject: test for duplicate emails", async () => {
    const res = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(res.register).toHaveLength(1)
    expect(res.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    })
  })

  it("Reject: bad emails without @", async () => {
    const res = await request(process.env.TEST_HOST as string, mutation(justString, password))
    expect(res.register[0]).toEqual({
      path: "email",
      message: invalidEmail
    })
  })

  it("Reject: Emails too short", async () => {
    const res = await request(process.env.TEST_HOST as string, mutation(emailToShort, password))
    expect(res.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough
    })
  })

  it("Reject: Emails too short", async () => {
    const res = await request(process.env.TEST_HOST as string, mutation(email, passwordToShort))
    expect(res.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    })
  })

  it("Reject: Bad password and bad email", async () => {
    const res = await request(
      process.env.TEST_HOST as string,
      mutation(justShortString, passwordToShort)
    )
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
    ])
  })
})
