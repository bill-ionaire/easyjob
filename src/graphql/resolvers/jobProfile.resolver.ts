import { GraphQLContext, requireAuth } from '../context'

export const jobProfileResolvers = {
  Query: {
    jobProfiles: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobProfile.findMany({
        where: { userId },
        include: { _count: { select: { applications: true, resumeDrafts: true } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      })
    },

    jobProfile: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobProfile.findFirst({
        where: { id: args.id, userId },
        include: { _count: { select: { applications: true, resumeDrafts: true } } },
      })
    },

    profileResumeDrafts: async (_: unknown, args: { profileId: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const profile = await ctx.prisma.jobProfile.findFirst({ where: { id: args.profileId, userId } })
      if (!profile) throw new Error('Profile not found')
      return ctx.prisma.profileResumeDraft.findMany({
        where: { jobProfileId: args.profileId },
        orderBy: { createdAt: 'desc' },
      })
    },
  },

  Mutation: {
    createJobProfile: async (_: unknown, args: { input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      if (args.input.isDefault) {
        await ctx.prisma.jobProfile.updateMany({ where: { userId }, data: { isDefault: false } })
      }
      return ctx.prisma.jobProfile.create({
        data: { ...args.input, userId },
        include: { _count: { select: { applications: true, resumeDrafts: true } } },
      })
    },

    updateJobProfile: async (_: unknown, args: { id: string; input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      if (args.input.isDefault) {
        await ctx.prisma.jobProfile.updateMany({ where: { userId }, data: { isDefault: false } })
      }
      return ctx.prisma.jobProfile.update({
        where: { id: args.id, userId },
        data: args.input,
        include: { _count: { select: { applications: true, resumeDrafts: true } } },
      })
    },

    deleteJobProfile: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      await ctx.prisma.jobProfile.delete({ where: { id: args.id, userId } })
      return true
    },

    createProfileResumeDraft: async (
      _: unknown,
      args: { profileId: string; title: string; cvData?: any },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const profile = await ctx.prisma.jobProfile.findFirst({ where: { id: args.profileId, userId } })
      if (!profile) throw new Error('Profile not found')
      return ctx.prisma.profileResumeDraft.create({
        data: {
          jobProfileId: args.profileId,
          title: args.title,
          cvData: args.cvData ?? {},
        },
      })
    },

    updateProfileResumeDraft: async (
      _: unknown,
      args: { id: string; title?: string; cvData?: any },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const draft = await ctx.prisma.profileResumeDraft.findFirst({
        where: { id: args.id, jobProfile: { userId } },
      })
      if (!draft) throw new Error('Draft not found')
      return ctx.prisma.profileResumeDraft.update({
        where: { id: args.id },
        data: {
          ...(args.title !== undefined && { title: args.title }),
          ...(args.cvData !== undefined && { cvData: args.cvData }),
        },
      })
    },

    deleteProfileResumeDraft: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const draft = await ctx.prisma.profileResumeDraft.findFirst({
        where: { id: args.id, jobProfile: { userId } },
      })
      if (!draft) throw new Error('Draft not found')
      await ctx.prisma.profileResumeDraft.delete({ where: { id: args.id } })
      return true
    },
  },

  JobProfile: {
    applicationCount: (parent: any) => parent._count?.applications ?? 0,
    resumeDraftCount: (parent: any) => parent._count?.resumeDrafts ?? 0,
  },
}
