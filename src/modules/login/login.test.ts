import * as Chance from "chance"
import { request } from "graphql-request"
import { User } from "../../entity/User"
import { invalidLogin, confirmEmailError } from "./errorMessages"
import { createTypeormConn } from "../../utils/createTypeormConn"

const chance = new Chance()

const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })

const registerMutation = (e: string, p: string) => `
mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
}
`

const loginMutation = (e: string, p: string) => `
mutation {
    login(email: "${e}", password: "${p}"){
      path
      message
    }
}
`

beforeAll(async () => {
  await createTypeormConn()
})

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const res = await request(process.env.TEST_HOST as string, loginMutation(e, p))

  expect(res).toEqual({
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
    await request(process.env.TEST_HOST as string, registerMutation(email, password))
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)

    await loginExpectError(email, password, confirmEmailError)
  })

  it("Reject: Check unconfirmed user", async () => {
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)

    await User.update({ email }, { confirmed: true })

    const res = await request(process.env.TEST_HOST as string, loginMutation(email, password))

    expect(res).toEqual({ login: null })
  })
})
