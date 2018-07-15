import IResolverMap from "../../types/graphql-utils"

export const resolvers: IResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise(response => {
        session.destroy(error => {
          if (error) {
            console.log("logout error: ", error)
          }
          response(true)
        })
      })
  }
}
