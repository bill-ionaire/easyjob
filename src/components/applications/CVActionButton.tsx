'use client'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, XCircle, ChevronDown, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TRIGGER_CV_GENERATION, JOB_APPLICATION_QUERY } from '@/lib/graphql/queries'

interface CVActionButtonProps {
  applicationId: string
  initialStatus?: string | null
  hasCvData: boolean
}

export function CVActionButton({ applicationId, initialStatus, hasCvData }: CVActionButtonProps) {
  const router = useRouter()
  const [polling, setPolling] = useState(false)
  const [status, setStatus] = useState(initialStatus)

  const { data, startPolling, stopPolling } = useQuery(JOB_APPLICATION_QUERY, {
    variables: { id: applicationId },
    skip: !polling,
    fetchPolicy: 'network-only',
  })

  const [trigger, { loading: triggering }] = useMutation(TRIGGER_CV_GENERATION, {
    onCompleted: () => {
      setStatus('pending')
      setPolling(true)
      startPolling(10000)
    },
  })

  useEffect(() => {
    const currentStatus = (data as any)?.jobApplication?.cvGenerationStatus
    if (currentStatus && currentStatus !== status) setStatus(currentStatus)
    if (currentStatus === 'done' || currentStatus === 'failed') {
      stopPolling()
      setPolling(false)
    }
  }, [data, status, stopPolling])

  useEffect(() => {
    if (initialStatus === 'pending' || initialStatus === 'generating') {
      setPolling(true)
      startPolling(10000)
    }
  }, [initialStatus, startPolling])

  const goToEditCv = () => router.push(`/dashboard/applications/${applicationId}/edit-cv`)

  if (status === 'pending' || status === 'generating') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {status === 'generating' ? 'Generating CV...' : 'Queued...'}
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={goToEditCv}>
          <Pencil className="h-3.5 w-3.5" />
          Edit Manually
        </Button>
      </div>
    )
  }

  if (status === 'done' || hasCvData) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          CV Ready
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={goToEditCv}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Manually
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => trigger({ variables: { applicationId } })}
                disabled={triggering}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate with AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-destructive">CV generation failed.</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => trigger({ variables: { applicationId } })}
            disabled={triggering}
          >
            <XCircle className="h-4 w-4" />
            Retry AI Generation
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={goToEditCv}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Manually
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={triggering}>
          {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Create CV
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => trigger({ variables: { applicationId } })} disabled={triggering}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={goToEditCv}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Manually
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
