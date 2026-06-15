'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Plus, Pencil, Trash2, Star, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  JOB_PROFILES_QUERY,
  CREATE_JOB_PROFILE,
  UPDATE_JOB_PROFILE,
  DELETE_JOB_PROFILE,
  PROFILE_RESUME_DRAFTS_QUERY,
  CREATE_PROFILE_RESUME_DRAFT,
  UPDATE_PROFILE_RESUME_DRAFT,
  DELETE_PROFILE_RESUME_DRAFT,
} from '@/lib/graphql/queries'
import { useForm } from 'react-hook-form'

interface ProfileForm {
  name: string
  linkedin: string
  phone: string
  github: string
  location: string
  description: string
  details: string
  isDefault: boolean
}

function ProfileDialog({ editProfile, onClose }: { editProfile?: any; onClose: () => void }) {
  const { register, handleSubmit, watch, setValue } = useForm<ProfileForm>({
    defaultValues: editProfile
      ? { name: editProfile.name, linkedin: editProfile.linkedin ?? '', phone: editProfile.phone ?? '', github: editProfile.github ?? '', location: editProfile.location ?? '', description: editProfile.description ?? '', details: editProfile.details ?? '', isDefault: editProfile.isDefault ?? false }
      : { name: '', linkedin: '', phone: '', github: '', location: '', description: '', details: '', isDefault: false },
  })

  const [create] = useMutation(CREATE_JOB_PROFILE, { refetchQueries: [JOB_PROFILES_QUERY] })
  const [update] = useMutation(UPDATE_JOB_PROFILE, { refetchQueries: [JOB_PROFILES_QUERY] })

  const onSubmit = async (data: ProfileForm) => {
    const input = { ...data, linkedin: data.linkedin || null, phone: data.phone || null, github: data.github || null, location: data.location || null, description: data.description || null, details: data.details || null }
    if (editProfile) {
      await update({ variables: { id: editProfile.id, input } })
    } else {
      await create({ variables: { input } })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-1.5">
        <Label>Profile Name *</Label>
        <Input {...register('name', { required: true })} placeholder="e.g. Software Engineer Profile" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>LinkedIn <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register('linkedin')} placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="grid gap-1.5">
          <Label>GitHub <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register('github')} placeholder="https://github.com/..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Phone <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
          <Input {...register('phone')} placeholder="+1 (555) 000-0000" />
        </div>
        <div className="grid gap-1.5">
          <Label>Location</Label>
          <Input {...register('location')} placeholder="City, Country" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Description / Bio</Label>
        <Textarea {...register('description')} rows={3} placeholder="Brief professional summary for this profile..." />
      </div>
      <div className="grid gap-1.5">
        <Label>Details <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea {...register('details')} rows={5} placeholder="Additional details, notes, or context for this profile..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="isDefault"
          checked={watch('isDefault')}
          onCheckedChange={(v) => setValue('isDefault', v)}
        />
        <Label htmlFor="isDefault" className="text-sm cursor-pointer">Set as default profile</Label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{editProfile ? 'Update Profile' : 'Create Profile'}</Button>
      </div>
    </form>
  )
}

// ─── Resume Drafts Dialog ─────────────────────────────────────────────────────

function ResumeDraftEditor({
  draft,
  onSave,
  onCancel,
}: {
  draft?: any
  onSave: (title: string, cvData: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(draft?.title ?? '')
  const [json, setJson] = useState(draft?.cvData ? JSON.stringify(draft.cvData, null, 2) : '')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const handleSave = () => {
    setJsonError(null)
    if (!title.trim()) return
    if (json.trim()) {
      try {
        JSON.parse(json)
      } catch {
        setJsonError('Invalid JSON — please fix before saving.')
        return
      }
    }
    onSave(title.trim(), json.trim())
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5">
        <Label className="text-xs">Draft Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xs h-8"
          placeholder="e.g. Backend Engineer v1"
        />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">CV Data (JSON)</Label>
        <Textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setJsonError(null) }}
          rows={16}
          className="font-mono text-xs"
          placeholder={'{\n  "contactInfo": {},\n  "summary": "",\n  "workExperiences": [],\n  "skills": []\n}'}
        />
        {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={!title.trim()} onClick={handleSave}>
          {draft ? 'Update Draft' : 'Create Draft'}
        </Button>
      </div>
    </div>
  )
}

function ResumeDraftsDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: any
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
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

  const handleCreate = async (title: string, cvDataStr: string) => {
    const cvData = cvDataStr ? JSON.parse(cvDataStr) : {}
    await createDraft({ variables: { profileId: profile.id, title, cvData } })
    setCreatingNew(false)
  }

  const handleUpdate = async (title: string, cvDataStr: string) => {
    const cvData = cvDataStr ? JSON.parse(cvDataStr) : {}
    await updateDraft({ variables: { id: editingDraft.id, title, cvData } })
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingDraft(d)}
                      >
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

// ─── Container ────────────────────────────────────────────────────────────────

export function JobProfilesContainer() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [draftsProfile, setDraftsProfile] = useState<any>(null)

  const { data, loading } = useQuery(JOB_PROFILES_QUERY)
  console.log(data)
  const [deleteProfile] = useMutation(DELETE_JOB_PROFILE, { refetchQueries: [JOB_PROFILES_QUERY] })

  const profiles = (data as any)?.jobProfiles ?? []

  return (
    <div className="col-span-3 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Apply to different jobs with different profiles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" />New Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Profile' : 'New Job Profile'}</DialogTitle>
            </DialogHeader>
            <ProfileDialog editProfile={editing} onClose={() => { setDialogOpen(false); setEditing(null) }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading profiles...</p>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No profiles yet. Create one to track applications by profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map((p: any) => (
            <div key={p.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    {p.isDefault && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                  </div>
                  {p.location && <p className="text-xs text-muted-foreground mt-0.5">{p.location}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-xs">{p.applicationCount} app{p.applicationCount !== 1 ? 's' : ''}</Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => setDraftsProfile(p)}
                  >
                    <FileText className="h-2.5 w-2.5 mr-1" />
                    {p.resumeDraftCount} draft{p.resumeDraftCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}

              <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>}
                {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>}
                {p.phone && <span>{p.phone}</span>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-7"
                  onClick={() => setDraftsProfile(p)}
                >
                  <FileText className="h-3 w-3" />
                  Resume Drafts
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setEditing(p); setDialogOpen(true) }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deleteProfile({ variables: { id: p.id } })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draftsProfile && (
        <ResumeDraftsDialog
          profile={draftsProfile}
          open={!!draftsProfile}
          onOpenChange={(v) => { if (!v) setDraftsProfile(null) }}
        />
      )}
    </div>
  )
}
