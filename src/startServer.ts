import "reflect-metadata"
import { GraphQLServer } from "graphql-yoga"
import { myRedis as redis } from "./redis"

import * as session from "express-session"
import * as connectRedis from "connect-redis"

import { createTypeormConn } from "./utils/createTypeormConn"
import { confirmEmail } from "./routs/confirmEmail"
import { genSchema } from "./utils/genSchema"
// import { redisSessionPrefix } from "./constants"

const SESSION_SECRET = "mysecret"
const RedisStore = connectRedis(session)

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      request
    })
  })

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 // 7 days
      }
    })
  )

  // my frontend
  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : "http://localhost:3000"
  }

  server.express.get("/confirm/:id", confirmEmail)

  await createTypeormConn()

  const serverPort: number = process.env.NODE_ENV === "test" ? 0 : 4000
  const options = {
    port: serverPort,
    cors
    // endpoint: "/graphql",
    // subscriptions: "/subscriptions",
    // playground: "/playground"
  }

  const app = await server.start(options, ({ port }) =>
    console.log(`Server started, listening on port ${port} for incoming requests.`)
  )

  return app
}
