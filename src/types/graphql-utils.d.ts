import { Redis } from "ioredis"

export interface ISession extends Express.Session {
  userId?: string
}

export interface IContext {
  redis: Redis
  url: string
  session: ISession
  request: Express.Request
}

export type Resolver = (parent: any, args: any, context: IContext, info: any) => any

export type GraphQLMiddlewareFunction = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: IContext,
  info: any
) => any

export default interface IResolverMap {
  [key: string]: {
    [key: string]: Resolver
  }
}
