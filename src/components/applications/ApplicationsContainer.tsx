'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { JOB_APPLICATIONS_QUERY, UPDATE_APPLICATION_STATUS, DELETE_APPLICATION } from '@/lib/graphql/queries'

const APPLICATION_STATUSES = [
  'saved', 'applied', 'phone_screen', 'interview', 'technical_test', 'offer', 'rejected', 'withdrawn',
]

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

const CV_STATUS_ICONS: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  generating: <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />,
  pending: <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />,
}

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ApplicationsContainer() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [cvReady, setCvReady] = useState(false)
  const [page, setPage] = useState(1)

  const filter = {
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(cvReady ? { cvReady: true } : {}),
  }

  const { data, loading } = useQuery(JOB_APPLICATIONS_QUERY, {
    variables: { filter, page, limit: 20 },
    fetchPolicy: 'cache-and-network',
  })

  const [updateStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    refetchQueries: [JOB_APPLICATIONS_QUERY],
  })
  const [deleteApp] = useMutation(DELETE_APPLICATION, {
    refetchQueries: [JOB_APPLICATIONS_QUERY],
  })

  const applications = (data as any)?.jobApplications?.items ?? []
  const totalPages = (data as any)?.jobApplications?.totalPages ?? 1
  const total = (data as any)?.jobApplications?.total ?? 0

  return (
    <div className="col-span-3 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Application Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} application{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={cvReady ? 'secondary' : 'outline'}
          size="sm"
          className="gap-1.5"
          onClick={() => { setCvReady((v) => !v); setPage(1) }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          CV Ready
        </Button>
      </div>

      {/* List */}
      {loading && applications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No applications yet.</p>
          <Link href="/dashboard/job-posts" className="mt-2">
            <Button variant="outline" size="sm">Browse Job Posts</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div key={app.id} className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">
                    <h3 className="font-medium text-sm leading-tight">{app.jobPost.title}</h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span>{app.jobPost.postedBy}</span>
                    {app.jobPost.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.jobPost.location}
                      </span>
                    )}
                    {app.jobProfile && <span>Profile: {app.jobProfile.name}</span>}
                    <span>Saved {format(new Date(app.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.cvGenerationStatus && CV_STATUS_ICONS[app.cvGenerationStatus]}
                  <Badge
                    className={`text-xs ${STATUS_COLORS[app.currentStatus] ?? 'bg-muted'}`}
                    variant="outline"
                  >
                    {formatLabel(app.currentStatus)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {APPLICATION_STATUSES.filter((s) => s !== app.currentStatus).slice(0, 3).map((s) => (
                  <Button
                    key={s}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => updateStatus({ variables: { id: app.id, status: s } })}
                  >
                    → {formatLabel(s)}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 text-destructive ml-auto"
                  onClick={() => deleteApp({ variables: { id: app.id } })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
