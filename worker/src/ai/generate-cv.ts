import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const CVSchema = z.object({
  contactInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    headline: z.string(),
  }),
  summary: z.string(),
  workExperiences: z.array(z.object({
    company: z.string(),
    title: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string(),
    highlights: z.array(z.string()).optional(),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
  skills: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()),
  })),
  certifications: z.array(z.object({
    title: z.string(),
    organization: z.string(),
    issueDate: z.string().optional(),
    credentialUrl: z.string().optional(),
  })).optional(),
  customSections: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).optional(),
})

export type GeneratedCV = z.infer<typeof CVSchema>

export async function generateCV(params: {
  jobTitle: string
  jobDescription: string
  salary: string | null
  location: string | null
  profileName: string | null
  linkedin: string | null
  github: string | null
  phone: string | null
  profileLocation: string | null
  profileDescription: string | null
  resumeData: any
}): Promise<GeneratedCV> {
  const prompt = buildPrompt(params)

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: CVSchema,
    prompt,
  })

  return object
}

function buildPrompt(params: typeof generateCV extends (p: infer P) => any ? P : never): string {
  const resumeSummary = params.resumeData
    ? JSON.stringify(params.resumeData, null, 2)
    : 'No resume data available'

  return `You are a professional CV writer. Generate a tailored CV in JSON format for the following job application.

JOB DETAILS:
Title: ${params.jobTitle}
Description: ${params.jobDescription}
${params.salary ? `Salary: ${params.salary}` : ''}
${params.location ? `Location: ${params.location}` : ''}

CANDIDATE PROFILE:
Name: ${params.profileName ?? 'Unknown'}
${params.linkedin ? `LinkedIn: ${params.linkedin}` : ''}
${params.github ? `GitHub: ${params.github}` : ''}
${params.phone ? `Phone: ${params.phone}` : ''}
${params.profileLocation ? `Location: ${params.profileLocation}` : ''}
${params.profileDescription ? `Bio: ${params.profileDescription}` : ''}

EXISTING RESUME DATA:
${resumeSummary}

Instructions:
- Tailor the CV specifically for the job description above
- Highlight relevant skills and experiences
- Keep the summary concise and targeted
- Ensure all bullet points are action-oriented and quantified where possible
- Match the tone and requirements of the job posting`
}
