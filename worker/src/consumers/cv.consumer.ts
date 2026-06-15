import amqplib from 'amqplib'
import { PrismaClient } from '@prisma/client'
import { generateCV } from '../ai/generate-cv.js'

const QUEUE_CV_GENERATE = 'queue.cv.generate'
const QUEUE_CV_DONE = 'queue.cv.done'

const prisma = new PrismaClient()

export async function startCVConsumer(amqpUrl: string) {
  const conn = await amqplib.connect(amqpUrl)
  const ch = await conn.createChannel()

  await ch.assertQueue(QUEUE_CV_GENERATE, { durable: true })
  await ch.assertQueue(QUEUE_CV_DONE, { durable: true })
  ch.prefetch(1)

  console.log('[worker] Listening on', QUEUE_CV_GENERATE)

  ch.consume(QUEUE_CV_GENERATE, async (msg) => {
    if (!msg) return

    let applicationId = ''
    let userId = ''

    try {
      const payload = JSON.parse(msg.content.toString()) as { applicationId: string; userId: string }
      applicationId = payload.applicationId
      userId = payload.userId

      console.log(`[worker] Processing CV for application ${applicationId}`)

      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { cvGenerationStatus: 'generating' },
      })

      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          jobPost: true,
          jobProfile: true,
          resume: {
            include: {
              ContactInfo: true,
              ResumeSections: {
                include: {
                  summary: true,
                  workExperiences: { include: { Company: true, jobTitle: true, location: true } },
                  educations: { include: { location: true } },
                  licenseOrCertifications: true,
                  others: true,
                },
              },
            },
          },
        },
      })

      if (!application) throw new Error(`Application ${applicationId} not found`)

      const cvData = await generateCV({
        jobTitle: application.jobPost.title,
        jobDescription: application.jobPost.description,
        salary: application.jobPost.salary,
        location: application.jobPost.location,
        profileName: application.jobProfile?.name ?? null,
        linkedin: application.jobProfile?.linkedin ?? null,
        github: application.jobProfile?.github ?? null,
        phone: application.jobProfile?.phone ?? null,
        profileLocation: application.jobProfile?.location ?? null,
        profileDescription: application.jobProfile?.description ?? null,
        resumeData: application.resume,
      })

      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { cvData: cvData as any, cvGenerationStatus: 'done' },
      })

      ch.sendToQueue(
        QUEUE_CV_DONE,
        Buffer.from(JSON.stringify({ applicationId, userId, success: true })),
        { persistent: true },
      )

      console.log(`[worker] CV generated for application ${applicationId}`)
      ch.ack(msg)
    } catch (err) {
      console.error(`[worker] CV generation failed for ${applicationId}:`, err)

      if (applicationId) {
        await prisma.jobApplication.update({
          where: { id: applicationId },
          data: { cvGenerationStatus: 'failed' },
        }).catch(() => {})

        ch.sendToQueue(
          QUEUE_CV_DONE,
          Buffer.from(JSON.stringify({ applicationId, userId, success: false, error: (err as Error).message })),
          { persistent: true },
        )
      }

      ch.nack(msg, false, false)
    }
  })

  conn.on('close', () => {
    console.error('[worker] AMQP connection closed, exiting...')
    process.exit(1)
  })

  conn.on('error', (err) => {
    console.error('[worker] AMQP error:', err)
    process.exit(1)
  })
}
