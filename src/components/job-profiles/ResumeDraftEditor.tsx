'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CvDataEditor, ResumeData } from './CvDataEditor'

interface Props {
  draft?: any
  onSave: (input: ResumeData & { title: string }) => void
  onCancel: () => void
}

const emptyData = (): ResumeData => ({
  contactInfo: {},
  summary: '',
  skills: [],
  experiences: [],
  educations: [],
  certifications: [],
})

function draftToResumeData(draft: any): ResumeData {
  return {
    contactInfo: draft.contactInfo ?? {},
    summary: draft.summary ?? '',
    skills: draft.skills ?? [],
    experiences: draft.experiences ?? [],
    educations: draft.educations ?? [],
    certifications: draft.certifications ?? [],
  }
}

export function ResumeDraftEditor({ draft, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(draft?.title ?? '')
  const [data, setData] = useState<ResumeData>(draft ? draftToResumeData(draft) : emptyData())

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5">
        <Label className="text-xs">Draft Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xs h-8"
          placeholder="e.g. Backend Engineer v1"
        />
      </div>
      <CvDataEditor value={data} onChange={setData} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button
          size="sm"
          disabled={!title.trim()}
          onClick={() => onSave({ ...data, title: title.trim() })}
        >
          {draft ? 'Update Draft' : 'Create Draft'}
        </Button>
      </div>
    </div>
  )
}
