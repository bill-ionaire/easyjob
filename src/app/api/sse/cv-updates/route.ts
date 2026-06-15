import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import { subscribeCVDone, CVDonePayload } from '@/lib/queue/amqp'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }
  const userId = session.user.id

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial ping so client knows the connection is open
      sendEvent({ type: 'connected' })

      const unsubscribe = await subscribeCVDone((payload: CVDonePayload) => {
        if (payload.userId !== userId) return
        sendEvent({ type: 'cv_done', applicationId: payload.applicationId, success: payload.success, error: payload.error })
      }).catch(() => async () => {})

      // Keep alive pings every 25 seconds to prevent proxy timeouts
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(interval)
        }
      }, 25000)

      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        if (typeof unsubscribe === 'function') unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
