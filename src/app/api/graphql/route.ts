import { createYoga } from 'graphql-yoga'
import { schema } from '@/graphql/schema'
import { createContext } from '@/graphql/context'
import { NextRequest } from 'next/server'

const { handleRequest } = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response, Request, ReadableStream },
  graphiql: process.env.NODE_ENV === 'development',
})

export async function GET(request: NextRequest) {
  return handleRequest(request, {})
}

export async function POST(request: NextRequest) {
  return handleRequest(request, {})
}
