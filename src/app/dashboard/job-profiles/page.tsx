import { Metadata } from 'next'
import { JobProfilesContainer } from '@/components/job-profiles/JobProfilesContainer'

export const metadata: Metadata = { title: 'Job Profiles | JobSync' }

export default function JobProfilesPage() {
  return <JobProfilesContainer />
}
