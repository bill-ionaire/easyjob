import { jobPostTypeDefs } from './jobPost.gql'
import { jobApplicationTypeDefs } from './jobApplication.gql'
import { jobProfileTypeDefs } from './jobProfile.gql'

const baseTypeDefs = /* GraphQL */ `
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`

export const typeDefs = [
  baseTypeDefs,
  jobPostTypeDefs,
  jobApplicationTypeDefs,
  jobProfileTypeDefs,
]
