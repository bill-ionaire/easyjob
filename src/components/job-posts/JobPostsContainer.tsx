'use client'
import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { JobPostCard } from './JobPostCard'
import { JOB_POSTS_QUERY, JOB_POST_INSIGHTS_QUERY } from '@/lib/graphql/queries'

export function JobPostsContainer() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const filter = {
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
  }

  const { data, loading, refetch } = useQuery(JOB_POSTS_QUERY, {
    variables: { filter, page, limit: 20 },
    fetchPolicy: 'cache-and-network',
  })

  const { data: insightsData } = useQuery(JOB_POST_INSIGHTS_QUERY)
  const d = data as any
  const insights = (insightsData as any)?.jobPostInsights

  const posts = d?.jobPosts?.items ?? []
  const totalPages = d?.jobPosts?.totalPages ?? 1

  return (
    <div className="col-span-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Posts</h1>
          {insights && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {insights.active} active · {insights.closed} closed · {insights.savedToApply} saved to apply
            </p>
          )}
        </div>
        <Link href="/dashboard/job-posts/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="inappropriate">Inappropriate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No job posts found.</p>
          <Link href="/dashboard/job-posts/new" className="mt-2">
            <Button variant="outline" size="sm">Add your first job post</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <JobPostCard key={post.id} post={post} onSaved={() => refetch()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
