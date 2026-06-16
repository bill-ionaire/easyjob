'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Plus, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  JOB_PROFILES_QUERY,
  PROFILE_RESUME_DRAFTS_QUERY,
  CREATE_PROFILE_RESUME_DRAFT,
  UPDATE_PROFILE_RESUME_DRAFT,
  DELETE_PROFILE_RESUME_DRAFT,
} from '@/lib/graphql/queries'
import { ResumeDraftEditor } from './ResumeDraftEditor'

interface Props {
  profile: any
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ResumeDraftsDialog({ profile, open, onOpenChange }: Props) {
  const [creatingNew, setCreatingNew] = useState(false)
  const [editingDraft, setEditingDraft] = useState<any>(null)

  const draftsQuery = { query: PROFILE_RESUME_DRAFTS_QUERY, variables: { profileId: profile.id } }

  const { data, loading } = useQuery(PROFILE_RESUME_DRAFTS_QUERY, {
    variables: { profileId: profile.id },
    skip: !open,
  })
  const drafts: any[] = (data as any)?.profileResumeDrafts ?? []

  const [createDraft] = useMutation(CREATE_PROFILE_RESUME_DRAFT, { refetchQueries: [draftsQuery, JOB_PROFILES_QUERY] })
  const [updateDraft] = useMutation(UPDATE_PROFILE_RESUME_DRAFT, { refetchQueries: [draftsQuery] })
  const [deleteDraft] = useMutation(DELETE_PROFILE_RESUME_DRAFT, { refetchQueries: [draftsQuery, JOB_PROFILES_QUERY] })

  const handleCreate = async (input: any) => {
    await createDraft({ variables: { profileId: profile.id, input } })
    setCreatingNew(false)
  }

  const handleUpdate = async (input: any) => {
    await updateDraft({ variables: { id: editingDraft.id, input } })
    setEditingDraft(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resume Drafts — {profile.name}</DialogTitle>
        </DialogHeader>

        {editingDraft ? (
          <ResumeDraftEditor
            draft={editingDraft}
            onSave={handleUpdate}
            onCancel={() => setEditingDraft(null)}
          />
        ) : creatingNew ? (
          <ResumeDraftEditor
            onSave={handleCreate}
            onCancel={() => setCreatingNew(false)}
          />
        ) : (
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading drafts...</p>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No resume drafts yet. Create one to use when manually editing application CVs.
              </p>
            ) : (
              <div className="space-y-2">
                {drafts.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between rounded border p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{d.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/profile/resume/${d.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview & Edit">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingDraft(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteDraft({ variables: { id: d.id } })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <Button size="sm" className="gap-1" onClick={() => setCreatingNew(true)}>
                <Plus className="h-4 w-4" />
                New Draft
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
