'use client'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export interface SkillGroup {
  label: string
  details: string[]
}

interface Props {
  value: SkillGroup[]
  onChange: (v: SkillGroup[]) => void
}

function SkillGroupItem({
  group,
  onChange,
  onRemove,
}: {
  group: SkillGroup
  onChange: (v: SkillGroup) => void
  onRemove: () => void
}) {
  const [detailInput, setDetailInput] = useState('')

  const addDetail = () => {
    const trimmed = detailInput.trim()
    if (!trimmed) return
    const items = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    onChange({ ...group, details: [...group.details, ...items] })
    setDetailInput('')
  }

  const removeDetail = (i: number) => {
    onChange({ ...group, details: group.details.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="rounded border p-2.5 space-y-2 bg-background">
      <div className="flex items-center gap-2">
        <Input
          className="text-xs h-7 flex-1"
          placeholder="Category (e.g. Programming Languages)"
          value={group.label}
          onChange={(e) => onChange({ ...group, label: e.target.value })}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {group.details.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {group.details.map((d, i) => (
            <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
              {d}
              <button
                type="button"
                onClick={() => removeDetail(i)}
                className="ml-0.5 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <Input
          className="text-xs h-7 flex-1"
          placeholder="Add skill(s), comma-separated"
          value={detailInput}
          onChange={(e) => setDetailInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addDetail() }
          }}
        />
        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={addDetail}>
          Add
        </Button>
      </div>
    </div>
  )
}

export function CvSkillsEditor({ value, onChange }: Props) {
  const addGroup = () => onChange([...value, { label: '', details: [] }])
  const updateGroup = (i: number, g: SkillGroup) => {
    const arr = [...value]
    arr[i] = g
    onChange(arr)
  }
  const removeGroup = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {value.map((group, i) => (
        <SkillGroupItem
          key={i}
          group={group}
          onChange={(g) => updateGroup(i, g)}
          onRemove={() => removeGroup(i)}
        />
      ))}
      <Button variant="outline" size="sm" className="gap-1 h-7 text-xs w-full" onClick={addGroup}>
        <Plus className="h-3 w-3" /> Add Skill Category
      </Button>
    </div>
  )
}
