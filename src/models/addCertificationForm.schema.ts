import { z } from "zod";

export const AddCertificationFormSchema = z.object({
  index: z.number().optional(),
  resumeId: z.string().optional(),
  title: z
    .string({
      error: "Certification title is required.",
    })
    .min(2),
  organization: z
    .string({
      error: "Issuing organization is required.",
    })
    .min(2),
  issueDate: z.date().nullable().optional(),
  expirationDate: z.date().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
  noExpiration: z.boolean().default(false).optional(),
});
