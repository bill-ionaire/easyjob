'use client'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Combobox } from '@/components/ComboBox'
import { getAllCompanies } from '@/actions/company.actions'
import { getAllJobLocations } from '@/actions/jobLocation.actions'
import { CREATE_JOB_POST, UPDATE_JOB_POST, JOB_POSTS_QUERY } from '@/lib/graphql/queries'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  postedAt: z.string().min(1, 'Posted date is required'),
  salary: z.string().optional(),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface JobPostFormProps {
  editPost?: {
    id: string
    title: string
    description: string
    postedBy: string
    postedAt: string
    salary?: string | null
    location?: string | null
    sourceUrl?: string | null
  }
  onSuccess?: () => void
}

export function JobPostForm({ editPost, onSuccess }: JobPostFormProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editPost
      ? {
          title: editPost.title,
          description: editPost.description,
          postedAt: format(new Date(editPost.postedAt), 'yyyy-MM-dd'),
          salary: editPost.salary ?? '',
          sourceUrl: editPost.sourceUrl ?? '',
          company: '',
          location: '',
        }
      : { postedAt: format(new Date(), 'yyyy-MM-dd') },
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      const [c, l] = await Promise.all([getAllCompanies(), getAllJobLocations()])
      if (!active) return
      const companyList: any[] = Array.isArray(c) ? c : []
      const locationList: any[] = Array.isArray(l) ? l : []

      if (editPost) {
        const matchedCompany = companyList.find((co) => co.label === editPost.postedBy)
        if (matchedCompany) {
          form.setValue('company', matchedCompany.id)
        } else if (editPost.postedBy) {
          const synthetic = { id: `__${editPost.postedBy}__`, label: editPost.postedBy, value: editPost.postedBy }
          companyList.unshift(synthetic)
          form.setValue('company', synthetic.id)
        }

        if (editPost.location) {
          const matchedLocation = locationList.find((lo) => lo.label === editPost.location)
          if (matchedLocation) {
            form.setValue('location', matchedLocation.id)
          } else {
            const synthetic = { id: `__${editPost.location}__`, label: editPost.location, value: editPost.location }
            locationList.unshift(synthetic)
            form.setValue('location', synthetic.id)
          }
        }
      }

      setCompanies([...companyList])
      setLocations([...locationList])
    })()
    return () => { active = false }
  }, [editPost]) // eslint-disable-line react-hooks/exhaustive-deps

  const [createPost] = useMutation(CREATE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })
  const [updatePost] = useMutation(UPDATE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })

  const onSubmit = async (data: FormData) => {
    const selectedCompany = companies.find((c) => c.id === data.company)
    const selectedLocation = locations.find((l) => l.id === data.location)

    const input = {
      title: data.title,
      description: data.description,
      postedBy: selectedCompany?.label ?? data.company,
      postedAt: new Date(data.postedAt).toISOString(),
      salary: data.salary || null,
      location: selectedLocation?.label ?? data.location ?? null,
      sourceUrl: data.sourceUrl || null,
    }

    if (editPost) {
      await updatePost({ variables: { id: editPost.id, input } })
    } else {
      await createPost({ variables: { input } })
    }

    onSuccess ? onSuccess() : router.push('/dashboard/job-posts')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Senior Software Engineer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Combobox options={companies} field={field} creatable />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Combobox options={locations} field={field} creatable />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posted Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. $120k–$150k" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source URL (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea {...field} rows={10} placeholder="Paste the full job description here..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : editPost ? 'Update Post' : 'Save Job Post'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
