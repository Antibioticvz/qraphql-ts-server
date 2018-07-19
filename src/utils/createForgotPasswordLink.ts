import { Redis } from "ioredis"
import * as v4 from "uuid/v4"
import { forgotPasswordPrefix } from "../constants"

export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const id = v4()
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 60 * 60 * 24)
  return `${url}/change-passvord/${id}`
}
