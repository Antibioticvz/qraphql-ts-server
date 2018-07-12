import axios from "axios"
import * as Chance from "chance"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"

const chance = new Chance()

let userId: string
let connection: Connection
const email = chance.email({ domain: "gmail.com", length: 10 })
const password = chance.string({ length: 10 })

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`

const meQuery = `
{
  me {
    id
    email
  }
}
`

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
  it("Reject: can't get user if not logged in", async () => {
    // later
  })

  it("Success", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    )

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    )

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    })
  })
})
