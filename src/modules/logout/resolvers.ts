import IResolverMap from "../../types/graphql-utils"
// import { userSessionIdPrefix } from "../../constants"

export const resolvers: IResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session

      if (userId) {
        const sessionIds = await redis.lrange(userId, 0, -1)

        console.log(">>>>>>>>>>>>>>>>>>>>> sessionIds")
        console.log(sessionIds)

        sessionIds.map((i: any) => {
          console.log(`>>>>>>>>>>>>>>>>>>>>> map  ${i}`)
          return redis.del(i)
        })
        const sessionIds2 = await redis.lrange(userId, 0, -1)

        console.log(">>>>>>>>>>>>>>>>>>>>> sessionIds2")
        console.log(sessionIds2)

        return true
      }

      return false
    }
  }
}
