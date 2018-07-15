import { Redis } from "ioredis"

export interface ISession extends Express.Session {
  userId?: string
}

export type Resolver = (
  parent: any,
  args: any,
  context: {
    redis: Redis
    url: string
    session: ISession
  },
  info: any
) => any

export type GraphQLMiddlewareFunction = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: {
    redis: Redis
    url: string
    session: ISession
  },
  info: any
) => any

export default interface IResolverMap {
  [key: string]: {
    [key: string]: Resolver
  }
}
