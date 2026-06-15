import amqplib from 'amqplib'

export const QUEUE_CV_GENERATE = 'queue.cv.generate'
export const QUEUE_CV_DONE = 'queue.cv.done'

export type CVGeneratePayload = {
  applicationId: string
  userId: string
}

export type CVDonePayload = {
  applicationId: string
  userId: string
  success: boolean
  error?: string
}

async function getConnection() {
  const url = process.env.LAVINMQ_URL
  if (!url) throw new Error('LAVINMQ_URL environment variable is not set')
  return amqplib.connect(url)
}

export async function publishCVGeneration(payload: CVGeneratePayload): Promise<void> {
  const conn = await getConnection()
  try {
    const ch = await conn.createChannel()
    await ch.assertQueue(QUEUE_CV_GENERATE, { durable: true })
    ch.sendToQueue(QUEUE_CV_GENERATE, Buffer.from(JSON.stringify(payload)), { persistent: true })
    await ch.close()
  } finally {
    await conn.close()
  }
}

export async function subscribeCVDone(
  onMessage: (payload: CVDonePayload) => void,
): Promise<() => Promise<void>> {
  const conn = await getConnection()
  const ch = await conn.createChannel()
  await ch.assertQueue(QUEUE_CV_DONE, { durable: true })
  ch.prefetch(1)
  ch.consume(QUEUE_CV_DONE, (msg) => {
    if (!msg) return
    try {
      const payload: CVDonePayload = JSON.parse(msg.content.toString())
      onMessage(payload)
      ch.ack(msg)
    } catch {
      ch.nack(msg, false, false)
    }
  })

  return async () => {
    await ch.close()
    await conn.close()
  }
}
