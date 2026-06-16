'use client'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  onRemove: () => void
}

export function CvCertificationItem({ value, onChange, onRemove }: Props) {
  const field = (key: string) => ({
    value: value[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value }),
  })
  return (
    <div className="rounded border p-2.5 space-y-2 bg-background">
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Title" {...field('title')} />
        <Input className="text-xs h-7" placeholder="Organization" {...field('organization')} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Issue date (optional)" {...field('issueDate')} />
        <Input className="text-xs h-7" placeholder="Expiration date (optional)" {...field('expirationDate')} />
      </div>
      <Input className="text-xs h-7" placeholder="Credential URL (optional)" {...field('credentialUrl')} />
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive h-7 px-2 text-xs gap-1"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3" /> Remove
      </Button>
    </div>
  )
}
