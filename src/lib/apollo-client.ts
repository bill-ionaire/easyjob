'use client'
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const errorLink = onError((error) => {
  const { graphQLErrors, networkError } = error as any
  if (graphQLErrors) {
    graphQLErrors.forEach((e: any) =>
      console.error(`[GraphQL error]: Message: ${e.message}, Path: ${e.path}`),
    )
  }
  if (networkError) console.error(`[Network error]: ${networkError}`)
})

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include',
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
