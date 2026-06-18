'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Plus, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PROFILE_RESUME_DRAFTS_QUERY,
  CREATE_PROFILE_RESUME_DRAFT,
  JOB_PROFILES_QUERY,
} from '@/lib/graphql/queries'
import { ResumeDraftEditor } from './ResumeDraftEditor'

interface Props {
  profileId: string
}

export function ResumeDraftsPageView({ profileId }: Props) {
  const [creating, setCreating] = useState(false)

  const draftsQuery = { query: PROFILE_RESUME_DRAFTS_QUERY, variables: { profileId } }

  const { data, loading } = useQuery(PROFILE_RESUME_DRAFTS_QUERY, { variables: { profileId } })
  const drafts: any[] = (data as any)?.profileResumeDrafts ?? []

  const [createDraft, { loading: saving }] = useMutation(CREATE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsQuery, JOB_PROFILES_QUERY],
    onCompleted: () => setCreating(false),
  })

  const handleCreate = (input: any) => createDraft({ variables: { profileId, input } })

  if (creating) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div>
            <h2 className="font-semibold">New Resume Template</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the fields and save.</p>
          </div>
          <ResumeDraftEditor
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={saving}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Reusable resume templates for this profile.
        </p>
        <Button size="sm" className="gap-1 shrink-0" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />New Template
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
          <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No resume templates yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Create one to reuse when applying to jobs.</p>
          <Button size="sm" variant="outline" className="mt-4 gap-1" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />New Template
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((d: any) => (
            <Link
              key={d.id}
              href={`/dashboard/job-profiles/${profileId}/resume/${d.id}`}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:underline">{d.title}</p>
                  {d.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.summary}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
