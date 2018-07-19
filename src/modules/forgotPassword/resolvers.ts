import * as bcrypt from "bcryptjs"

import IResolverMap from "../../types/graphql-utils"
import { User } from "../../entity/User"
import { invalidLogin, confirmEmailError } from "./errorMessages"
import { userSessionIdPrefix } from "../../constants"

const errorResponse = [
  {
    path: "email",
    message: invalidLogin
  }
]

const errorConfirmEmail = [
  {
    path: "email",
    message: confirmEmailError
  }
]

export const resolvers: IResolverMap = {
  Query: {
    dummy2: () => "bye"
  },
  Mutation: {
    logout: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, request }
    ) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return errorConfirmEmail
      }

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return errorResponse
      }

      // login successful
      session.userId = user.id
      if (request.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, request.sessionID)
      }

      return null
    }
  }
}
