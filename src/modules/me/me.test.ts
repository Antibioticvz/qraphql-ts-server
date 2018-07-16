import * as Chance from "chance"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import { TestClient } from "../../utils/testClient"

const client = new TestClient(process.env.TEST_HOST as string)

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

describe("Me from cooki", async () => {
  it("Reject: can't get user`s self credentials if not logged in", async () => {
    const response = await client.me()

    expect(response.data.me).toBeNull()
  })

  it("Success: can get Me credentials", async () => {
    await client.login(email, password)

    const response = await client.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    })
  })
})
