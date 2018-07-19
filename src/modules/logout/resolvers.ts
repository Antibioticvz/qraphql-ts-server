import IResolverMap from "../../types/graphql-utils"
import { userSessionIdPrefix, redisSessionPrefix } from "../../constants"

export const resolvers: IResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session

      if (userId) {
        const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1)

        const redisPipeline = redis.multi()
        sessionIds.map((key: string) => {
          redisPipeline.del(`${redisSessionPrefix}${key}`)
        })
        await redisPipeline.exec(err => {
          if (err) {
            console.log(err)
          }
        })

        return true
      }

      return false
    }
  }
}
