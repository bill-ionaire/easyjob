'use client'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
  onRemove: () => void
}

export function CvEducationItem({ value, onChange, onRemove }: Props) {
  const field = (key: string) => ({
    value: value[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value }),
  })
  return (
    <div className="rounded border p-2.5 space-y-2 bg-background">
      <Input className="text-xs h-7" placeholder="Institution" {...field('institution')} />
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Degree" {...field('degree')} />
        <Input className="text-xs h-7" placeholder="Field of study" {...field('fieldOfStudy')} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-7" placeholder="Start year" {...field('startDate')} />
        <Input className="text-xs h-7" placeholder="End year (optional)" {...field('endDate')} />
      </div>
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
