import * as yup from "yup"

import IResolverMap from "../../types/graphql-utils"
import { User } from "../../entity/User"
import { formatYupError } from "../../utils/formatYupError"
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink"
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
  duplicateEmail
} from "./errorMessages"

const schema = yup.object().shape({
  email: yup
    .string()
    .min(7, emailNotLongEnough)
    .max(100)
    .email(invalidEmail),
  password: yup
    .string()
    .min(5, passwordNotLongEnough)
    .max(255)
})

export const resolvers: IResolverMap = {
  Query: {
    bye: () => "bye User"
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }
      const { email, password } = args

      const userAlreadyExist = await User.findOne({
        where: { email },
        select: ["id"]
      })

      if (userAlreadyExist) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ]
      }

      const user = User.create({
        email,
        password
      })

      await user.save()

      // ToDo implement an email client to sent a User register link
      await createConfirmEmailLink(url, user.id, redis)

      return null
    }
  }
}
