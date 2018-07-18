import * as Chance from "chance"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import { TestClient } from "../../utils/TestClient"

const firstSession = new TestClient(process.env.TEST_HOST as string)
const secondSession = new TestClient(process.env.TEST_HOST as string)

const chance = new Chance()

let userId: string
let connection: Connection
const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })

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

describe("Logout", async () => {
  it("Make sure that this user is logged in", async () => {
    await firstSession.login(email, password)

    const response = await firstSession.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    })
  })

  it("Success: single session logged out", async () => {
    await firstSession.logout()

    const response = await firstSession.me()

    expect(response.data.me).toBeNull()
  })

  it("Success: multiple session logged in", async () => {
    await firstSession.login(email, password)
    await secondSession.login(email, password)

    expect(await firstSession.me()).toEqual(await secondSession.me())
  })

  it("Success: multiple session logged out", async () => {
    await firstSession.logout()

    expect(await firstSession.me()).toBeNull()
    expect(await secondSession.me()).toBeNull()
  })
})
