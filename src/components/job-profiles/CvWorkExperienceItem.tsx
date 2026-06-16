'use client'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  onRemove: () => void
}

export function CvWorkExperienceItem({ value, onChange, onRemove }: Props) {
  const field = (key: string) => ({
    value: value[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: e.target.value }),
  })
  return (
    <div className="rounded border p-2.5 space-y-2 bg-background">
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Company" {...field('company')} />
        <Input className="text-xs h-7" placeholder="Job title" {...field('jobTitle')} />
      </div>
      <Input className="text-xs h-7" placeholder="Location (optional)" {...field('location')} />
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Start (e.g. Jan 2020)" {...field('startDate')} />
        <Input className="text-xs h-7" placeholder="End (or Present)" {...field('endDate')} />
      </div>
      <Textarea className="text-xs" rows={3} placeholder="Description / achievements..." {...field('description')} />
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
