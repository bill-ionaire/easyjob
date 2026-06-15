import { YogaInitialContext } from 'graphql-yoga'
import { auth } from '@/auth'
import prisma from '@/lib/db'

export type GraphQLContext = {
  prisma: typeof prisma
  userId: string | null
}

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  const session = await auth()
  return {
    prisma,
    userId: session?.user?.id ?? null,
  }
}

export function requireAuth(userId: string | null): string {
  if (!userId) throw new Error('Not authenticated')
  return userId
}
