import axios from "axios"
import { request } from "graphql-request"
import * as Chance from "chance"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"
import { LoneAnonymousOperation } from "graphql/validation/rules/LoneAnonymousOperation"

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

const logoutMutation = `
mutation {
  logout
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

  // Login user
  await axios.post(
    process.env.TEST_HOST as string,
    {
      query: loginMutation(email, password)
    },
    {
      withCredentials: true
    }
  )
})
afterAll(async () => {
  connection.close()
})

describe("Logout", async () => {
  it("Make sure that this user is logged in", async () => {
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

  it("Success: logged out", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
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

    // no cookie anymore
    expect(response.data.data.me).toBeNull()
  })
})
