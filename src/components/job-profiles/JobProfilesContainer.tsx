'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Plus, Pencil, Trash2, Star, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JOB_PROFILES_QUERY, DELETE_JOB_PROFILE } from '@/lib/graphql/queries'
import { ProfileDialog } from './ProfileDialog'
import { ResumeDraftsDialog } from './ResumeDraftsDialog'

export function JobProfilesContainer() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [draftsProfile, setDraftsProfile] = useState<any>(null)

  const { data, loading } = useQuery(JOB_PROFILES_QUERY)
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
            <ProfileDialog
              editProfile={editing}
              onClose={() => { setDialogOpen(false); setEditing(null) }}
            />
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
                  <Badge variant="outline" className="text-xs">
                    {p.applicationCount} app{p.applicationCount !== 1 ? 's' : ''}
                  </Badge>
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
