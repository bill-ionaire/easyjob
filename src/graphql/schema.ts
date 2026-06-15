import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './schema/index'
import { resolvers } from './resolvers/index'
import { GraphQLJSON } from 'graphql-scalars'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    ...resolvers,
    JSON: GraphQLJSON,
  },
})
