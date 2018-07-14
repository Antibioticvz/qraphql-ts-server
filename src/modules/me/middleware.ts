import { Resolver } from "../../types/graphql-utils"
import logger from "../../utils/logger"

export default async (resolver: Resolver, parent: any, args: any, context: any, info: any) => {
  // middleware
  // logger(parent, args, context, info)
  // end of middleware

  const result = await resolver(parent, args, context, info)
  // afterware

  return result
}
