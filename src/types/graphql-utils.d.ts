import { Redis } from "ioredis"
import { url, Session } from "inspector"

export interface ISession {
  userId?: string
}
export default interface IResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      context: {
        redis: Redis
        url: string
        session: ISession
      },
      info: any
    ) => any
  }
}
