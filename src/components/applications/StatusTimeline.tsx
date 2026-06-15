'use client'
import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800',
  applied: 'bg-indigo-100 text-indigo-800',
  phone_screen: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-orange-100 text-orange-800',
  technical_test: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-600',
  closed: 'bg-gray-100 text-gray-500',
}

interface StatusEntry {
  id: string
  status: string
  changedAt: string
  note?: string | null
  durationFromPreviousMinutes?: number | null
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1440)}d`
}

function formatLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusTimeline({ history }: { history: StatusEntry[] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status history yet.</p>
  }

  return (
    <ol className="relative border-l border-border ml-3">
      {history.map((entry, i) => (
        <li key={entry.id} className="mb-6 ml-6">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-border">
            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs ${STATUS_COLORS[entry.status] ?? 'bg-muted text-foreground'}`} variant="outline">
              {formatLabel(entry.status)}
            </Badge>
            {entry.durationFromPreviousMinutes != null && (
              <span className="text-xs text-muted-foreground">
                (+{formatDuration(entry.durationFromPreviousMinutes)} from previous)
              </span>
            )}
          </div>
          <time className="text-xs text-muted-foreground mt-0.5 block">
            {format(new Date(entry.changedAt), 'MMM d, yyyy h:mm a')}
          </time>
          {entry.note && (
            <p className="mt-1 text-sm text-foreground">{entry.note}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
