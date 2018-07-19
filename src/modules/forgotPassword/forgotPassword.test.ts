import * as Chance from "chance"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import { TestClient } from "../../utils/testClient"
import { myRedis as redis } from "../../redis"
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink"

const session = new TestClient(process.env.TEST_HOST as string)

const chance = new Chance()

let userId: string
let connection: Connection

const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })
const newPassword = chance.string({ length: 11 })

beforeAll(async () => {
  connection = await createTypeormConn()

  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save()
  userId = user.id
})
afterAll(async () => {
  connection.close()
})

describe("Forgot password", async () => {
  it("Make sure it works", async () => {
    const url = await createForgotPasswordLink("", userId, redis)
    const parts = url.split("/")
    const key = parts[parts.length]

    const response = await session.forgotPasswordChange(newPassword, key)
    expect(response.data).toEqual({
      forgotPasswordChange: null
    })

    await session.login(email, newPassword)
    expect(await session.me()).toEqual({
      data: { me: { id: userId, email } }
    })
  })
})
