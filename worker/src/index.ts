import 'dotenv/config'
import { startCVConsumer } from './consumers/cv.consumer.js'

const LAVINMQ_URL = process.env.LAVINMQ_URL
const DATABASE_URL = process.env.DATABASE_URL

if (!LAVINMQ_URL) {
  console.error('LAVINMQ_URL environment variable is required')
  process.exit(1)
}

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

console.log('[worker] Starting JobSync CV generation worker...')

const MAX_RETRIES = 10
const RETRY_DELAY_MS = 5000

async function start(attempt = 1): Promise<void> {
  try {
    await startCVConsumer(LAVINMQ_URL!)
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error('[worker] Max retries reached, exiting')
      process.exit(1)
    }
    console.error(`[worker] Connection failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms...`, err)
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    return start(attempt + 1)
  }
}

start()
