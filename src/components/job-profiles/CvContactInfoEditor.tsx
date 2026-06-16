'use client'
import { Input } from '@/components/ui/input'

interface Props {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}

export function CvContactInfoEditor({ value, onChange }: Props) {
  const field = (key: string) => ({
    value: value[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value }),
  })
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Info</p>
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-8" placeholder="First name" {...field('firstName')} />
        <Input className="text-xs h-8" placeholder="Last name" {...field('lastName')} />
      </div>
      <Input className="text-xs h-8" placeholder="Headline / Job title" {...field('headline')} />
      <div className="grid grid-cols-2 gap-2">
        <Input className="text-xs h-8" placeholder="Email" {...field('email')} />
        <Input className="text-xs h-8" placeholder="Phone" {...field('phone')} />
      </div>
      <Input className="text-xs h-8" placeholder="Address (optional)" {...field('address')} />
    </div>
  )
}
