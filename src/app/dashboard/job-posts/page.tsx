import { Metadata } from 'next'
import { JobPostsContainer } from '@/components/job-posts/JobPostsContainer'

export const metadata: Metadata = { title: 'Job Posts | JobSync' }

export default function JobPostsPage() {
  return <JobPostsContainer />
}
