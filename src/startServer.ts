import { GraphQLServer } from "graphql-yoga";
import { myRedis as redis } from "./redis";

import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routs/confirmEmail";
import { genSchema } from "./utils/genSchema";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConn();

  const serverPort: number = process.env.NODE_ENV === "test" ? 0 : 4000;
  const options = {
    port: serverPort
    // endpoint: "/graphql",
    // subscriptions: "/subscriptions",
    // playground: "/playground"
  };

  const app = await server.start(options, ({ port }) =>
    console.log(
      `Server started, listening on port ${port} for incoming requests.`
    )
  );

  return app;
};
