'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { MapPin, DollarSign, Calendar, ExternalLink, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SET_JOB_POST_STATUS, DELETE_JOB_POST, JOB_POSTS_QUERY } from '@/lib/graphql/queries'
import { SaveToApplyDialog } from './SaveToApplyDialog'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inappropriate: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}

interface JobPostCardProps {
  post: {
    id: string
    title: string
    salary?: string | null
    locations?: string[] | null
    postedAt: string
    postedBy: string
    sourceUrl?: string | null
    status: string
    applicationCount: number
    savedProfileIds: string[]
  }
  onSaved?: () => void
}

export function JobPostCard({ post, onSaved }: JobPostCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const [setStatus] = useMutation(SET_JOB_POST_STATUS, { refetchQueries: [JOB_POSTS_QUERY] })
  const [deletePost] = useMutation(DELETE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })

  const locations = post.locations ?? []

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border rounded-lg hover:bg-muted/40 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/job-posts/${post.id}`}
              className="font-medium text-sm hover:underline underline-offset-2 truncate"
            >
              {post.title}
            </Link>
            <Badge className={`text-xs shrink-0 ${STATUS_COLORS[post.status] ?? ''}`} variant="outline">
              {post.status}
            </Badge>
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
            <span>{post.postedBy}</span>
            {locations.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {locations.join(' · ')}
              </span>
            )}
            {post.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {post.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(post.postedAt), 'MMM d, yyyy')}
            </span>
            <span>
              {post.applicationCount > 0
                ? `${post.applicationCount} application${post.applicationCount !== 1 ? 's' : ''}`
                : 'No applications'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {post.sourceUrl && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <Link href={`/dashboard/job-posts/${post.id}`}>View</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={post.status !== 'active'}
                onClick={() => setDialogOpen(true)}
              >
                Save to Apply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {post.status !== 'closed' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'closed' } })}>
                  Mark as Closed
                </DropdownMenuItem>
              )}
              {post.status !== 'inappropriate' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'inappropriate' } })}>
                  Mark as Inappropriate
                </DropdownMenuItem>
              )}
              {post.status !== 'active' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'active' } })}>
                  Mark as Active
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deletePost({ variables: { id: post.id } })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SaveToApplyDialog
        jobPostId={post.id}
        jobPostTitle={post.title}
        savedProfileIds={post.savedProfileIds}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={onSaved}
      />
    </>
  )
}
