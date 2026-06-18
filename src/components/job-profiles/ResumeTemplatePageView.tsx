'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import {
  RESUME_DRAFT_QUERY,
  UPDATE_PROFILE_RESUME_DRAFT,
  DELETE_PROFILE_RESUME_DRAFT,
  PROFILE_RESUME_DRAFTS_QUERY,
  JOB_PROFILES_QUERY,
  RESUME_LINKED_APPLICATIONS_QUERY,
} from '@/lib/graphql/queries'
import { CvDataEditor, ResumeData } from './CvDataEditor'

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800',
  applied: 'bg-indigo-100 text-indigo-800',
  phone_screen: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-orange-100 text-orange-800',
  technical_test: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-600',
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function draftToResumeData(draft: any): ResumeData {
  return {
    contactInfo: draft.contactInfo ?? {},
    summary: draft.summary ?? '',
    skills: draft.skills ?? [],
    experiences: draft.experiences ?? [],
    educations: draft.educations ?? [],
    certifications: draft.certifications ?? [],
  }
}

export function ResumeTemplatePageView() {
  const { id: profileId, resumeId } = useParams<{ id: string; resumeId: string }>()
  const router = useRouter()

  const { data: resumeData, loading: resumeLoading } = useQuery(RESUME_DRAFT_QUERY, {
    variables: { id: resumeId },
  })
  const resume = (resumeData as any)?.resumeDraft

  const { data: appsData, loading: appsLoading } = useQuery(RESUME_LINKED_APPLICATIONS_QUERY, {
    variables: { resumeId },
    skip: !resumeId,
  })
  const linkedApps: any[] = (appsData as any)?.jobApplications?.items ?? []

  const [title, setTitle] = useState('')
  const [cvData, setCvData] = useState<ResumeData | null>(null)

  if (!resumeLoading && resume && cvData === null) {
    setTitle(resume.title ?? '')
    setCvData(draftToResumeData(resume))
  }

  const draftsRefetch = { query: PROFILE_RESUME_DRAFTS_QUERY, variables: { profileId } }

  const [updateDraft, { loading: saving }] = useMutation(UPDATE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsRefetch, JOB_PROFILES_QUERY],
    onCompleted: () => toast({ title: 'Template saved.' }),
    onError: (e) => toast({ variant: 'destructive', title: 'Failed to save', description: e.message }),
  })

  const [deleteDraft, { loading: deleting }] = useMutation(DELETE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsRefetch, JOB_PROFILES_QUERY],
    onCompleted: () => router.push(`/dashboard/job-profiles/${profileId}?tab=resume-templates`),
    onError: (e) => toast({ variant: 'destructive', title: 'Failed to delete', description: e.message }),
  })

  const handleSave = () => {
    if (!title.trim() || !cvData) return
    updateDraft({
      variables: {
        id: resumeId,
        input: { title: title.trim(), ...cvData },
      },
    })
  }

  if (resumeLoading || cvData === null) {
    return (
      <div className="col-span-3 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="col-span-3 space-y-4">
        <Link href={`/dashboard/job-profiles/${profileId}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">Resume template not found.</p>
      </div>
    )
  }

  return (
    <div className="col-span-3 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link href={`/dashboard/job-profiles/${profileId}`}>
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" />Back to Profile
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{resume.title}</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
              Delete Template
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete resume template?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-medium">"{resume.title}"</span>.
                {linkedApps.length > 0 && (
                  <span className="block mt-1 text-destructive">
                    Warning: {linkedApps.length} application{linkedApps.length !== 1 ? 's are' : ' is'} linked to this template.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteDraft({ variables: { id: resumeId } })}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-lg border bg-card p-5 space-y-5">
            <h2 className="font-semibold text-sm">Edit Template</h2>

            <div className="grid gap-1.5">
              <Label className="text-xs">Template Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm h-9"
                placeholder="e.g. Backend Engineer v1"
              />
            </div>

            <CvDataEditor value={cvData} onChange={setCvData} />

            <div className="flex justify-end pt-2">
              <Button disabled={!title.trim() || saving} onClick={handleSave}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Linked Applications</h2>
            {appsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : linkedApps.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No applications are using this template yet.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedApps.map((app: any) => (
                  <Link
                    key={app.id}
                    href={`/dashboard/applications/${app.id}`}
                    className="flex items-start justify-between gap-2 rounded border p-2.5 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate group-hover:underline">{app.jobPost.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.jobPost.postedBy}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_COLORS[app.currentStatus] ?? 'bg-muted'}`}
                      >
                        {formatStatus(app.currentStatus)}
                      </Badge>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
