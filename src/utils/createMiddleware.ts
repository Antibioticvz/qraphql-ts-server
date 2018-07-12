import { Resolver, GraphQLMiddlewareFunction } from "../types/graphql-utils";

export const createMiddleware = (middleware: GraphQLMiddlewareFunction, resolverFunction: Resolver)=>(
    parent: any, args: any, context: any, info: any)=>middlewareFunction(resolverFunction, parent, args, context, info)
)