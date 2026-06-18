import { Metadata } from 'next'
import { ResumeTemplatePageView } from '@/components/job-profiles/ResumeTemplatePageView'

export const metadata: Metadata = { title: 'Resume Template | JobSync' }

export default function ResumeTemplatePage() {
  return <ResumeTemplatePageView />
}
