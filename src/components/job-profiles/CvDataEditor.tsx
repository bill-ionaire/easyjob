'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CvContactInfoEditor } from './CvContactInfoEditor'
import { CvWorkExperienceItem } from './CvWorkExperienceItem'
import { CvEducationItem } from './CvEducationItem'
import { CvSkillsEditor, SkillGroup } from './CvSkillsEditor'
import { CvCertificationItem } from './CvCertificationItem'

export interface ResumeData {
  contactInfo: Record<string, string>
  summary: string
  skills: SkillGroup[]
  experiences: any[]
  educations: any[]
  certifications: any[]
}

interface Props {
  value: ResumeData
  onChange: (v: ResumeData) => void
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

export function CvDataEditor({ value, onChange }: Props) {
  const set = <K extends keyof ResumeData>(key: K, v: ResumeData[K]) =>
    onChange({ ...value, [key]: v })

  const addExp = () => set('experiences', [...value.experiences, {}])
  const updateExp = (i: number, v: any) => {
    const arr = [...value.experiences]; arr[i] = v; set('experiences', arr)
  }
  const removeExp = (i: number) => set('experiences', value.experiences.filter((_, idx) => idx !== i))

  const addEdu = () => set('educations', [...value.educations, {}])
  const updateEdu = (i: number, v: any) => {
    const arr = [...value.educations]; arr[i] = v; set('educations', arr)
  }
  const removeEdu = (i: number) => set('educations', value.educations.filter((_, idx) => idx !== i))

  const addCert = () => set('certifications', [...value.certifications, {}])
  const updateCert = (i: number, v: any) => {
    const arr = [...value.certifications]; arr[i] = v; set('certifications', arr)
  }
  const removeCert = (i: number) => set('certifications', value.certifications.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-5">
      <CvContactInfoEditor value={value.contactInfo} onChange={(v) => set('contactInfo', v)} />

      <Section label="Summary">
        <Textarea
          className="text-xs"
          rows={4}
          placeholder="Professional summary..."
          value={value.summary}
          onChange={(e) => set('summary', e.target.value)}
        />
      </Section>

      <Section label="Skills">
        <CvSkillsEditor value={value.skills} onChange={(v) => set('skills', v)} />
      </Section>

      <Section label="Experience">
        {value.experiences.map((exp, i) => (
          <CvWorkExperienceItem key={i} value={exp} onChange={(v) => updateExp(i, v)} onRemove={() => removeExp(i)} />
        ))}
        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs w-full" onClick={addExp}>
          <Plus className="h-3 w-3" /> Add Experience
        </Button>
      </Section>

      <Section label="Education">
        {value.educations.map((edu, i) => (
          <CvEducationItem key={i} value={edu} onChange={(v) => updateEdu(i, v)} onRemove={() => removeEdu(i)} />
        ))}
        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs w-full" onClick={addEdu}>
          <Plus className="h-3 w-3" /> Add Education
        </Button>
      </Section>

      <Section label="Certifications">
        {value.certifications.map((cert, i) => (
          <CvCertificationItem key={i} value={cert} onChange={(v) => updateCert(i, v)} onRemove={() => removeCert(i)} />
        ))}
        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs w-full" onClick={addCert}>
          <Plus className="h-3 w-3" /> Add Certification
        </Button>
      </Section>
    </div>
  )
}
