import * as bcrypt from "bcryptjs"

import IResolverMap from "../../types/graphql-utils"
import { User } from "../../entity/User"
import { invalidLogin, confirmEmailError } from "./errorMessages"

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
    bye2: () => "bye"
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { session }) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return errorConfirmEmail
      }

      const valid = await bcrypt.compare(password, user.password)

      if (valid && user) {
        // login successful
        session.userId = user.id

        return null
      }

      return errorResponse
    }
  }
}
