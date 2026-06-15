'use client'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TRIGGER_CV_GENERATION, JOB_APPLICATION_QUERY } from '@/lib/graphql/queries'

interface CVGenerationButtonProps {
  applicationId: string
  initialStatus?: string | null
}

export function CVGenerationButton({ applicationId, initialStatus }: CVGenerationButtonProps) {
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
    if (currentStatus && currentStatus !== status) {
      setStatus(currentStatus)
    }
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

  if (status === 'done') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        CV Ready
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => trigger({ variables: { applicationId } })}
        disabled={triggering}
      >
        <XCircle className="h-4 w-4" />
        Retry CV Generation
      </Button>
    )
  }

  if (status === 'pending' || status === 'generating') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {status === 'generating' ? 'Generating CV...' : 'Queued...'}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => trigger({ variables: { applicationId } })}
      disabled={triggering}
    >
      {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Generate CV
    </Button>
  )
}
