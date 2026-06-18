'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Plus, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PROFILE_RESUME_DRAFTS_QUERY,
  CREATE_PROFILE_RESUME_DRAFT,
  UPDATE_PROFILE_RESUME_DRAFT,
  DELETE_PROFILE_RESUME_DRAFT,
  JOB_PROFILES_QUERY,
} from '@/lib/graphql/queries'
import { ResumeDraftEditor } from './ResumeDraftEditor'

type PanelState =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; draft: any }

interface Props {
  profileId: string
}

export function ResumeDraftsPageView({ profileId }: Props) {
  const [panel, setPanel] = useState<PanelState>({ mode: 'list' })

  const draftsQuery = { query: PROFILE_RESUME_DRAFTS_QUERY, variables: { profileId } }

  const { data, loading: draftsLoading } = useQuery(PROFILE_RESUME_DRAFTS_QUERY, {
    variables: { profileId },
  })
  const drafts: any[] = (data as any)?.profileResumeDrafts ?? []

  const [createDraft, { loading: creating }] = useMutation(CREATE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsQuery, JOB_PROFILES_QUERY],
    onCompleted: () => setPanel({ mode: 'list' }),
  })
  const [updateDraft, { loading: updating }] = useMutation(UPDATE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsQuery],
    onCompleted: () => setPanel({ mode: 'list' }),
  })
  const [deleteDraft] = useMutation(DELETE_PROFILE_RESUME_DRAFT, {
    refetchQueries: [draftsQuery, JOB_PROFILES_QUERY],
  })

  const handleCreate = (input: any) => createDraft({ variables: { profileId, input } })
  const handleUpdate = (input: any) => {
    if (panel.mode !== 'edit') return
    updateDraft({ variables: { id: panel.draft.id, input } })
  }

  const saving = creating || updating
  const isEditing = panel.mode !== 'list'

  return (
    <div className={isEditing ? 'grid grid-cols-1 lg:grid-cols-5 gap-6' : 'space-y-4'}>
      {/* List panel */}
      <div className={`space-y-4 ${isEditing ? 'lg:col-span-2' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Reusable resume templates for this profile.
          </p>
          {panel.mode === 'list' && (
            <Button size="sm" className="gap-1 shrink-0" onClick={() => setPanel({ mode: 'create' })}>
              <Plus className="h-4 w-4" />New Template
            </Button>
          )}
        </div>

        {draftsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
            <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No resume templates yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Create one to reuse when applying to jobs.</p>
            {panel.mode === 'list' && (
              <Button size="sm" variant="outline" className="mt-4 gap-1" onClick={() => setPanel({ mode: 'create' })}>
                <Plus className="h-4 w-4" />New Template
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((d: any) => {
              const isActive = panel.mode === 'edit' && panel.draft.id === d.id
              return (
                <div
                  key={d.id}
                  className={`flex items-center justify-between rounded-lg border bg-card p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      {d.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Link href={`/dashboard/profile/resume/${d.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPanel({ mode: 'edit', draft: d })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteDraft({ variables: { id: d.id } })
                        if (panel.mode === 'edit' && panel.draft.id === d.id) setPanel({ mode: 'list' })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Editor panel */}
      {isEditing && (
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-card p-5 space-y-4 sticky top-4">
            <div>
              <h2 className="font-semibold">
                {panel.mode === 'create' ? 'New Template' : `Edit: ${panel.draft.title}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {panel.mode === 'create'
                  ? 'Fill in the resume template fields below.'
                  : 'Update the template fields and save.'}
              </p>
            </div>
            <ResumeDraftEditor
              draft={panel.mode === 'edit' ? panel.draft : undefined}
              onSave={panel.mode === 'create' ? handleCreate : handleUpdate}
              onCancel={() => setPanel({ mode: 'list' })}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  )
}
