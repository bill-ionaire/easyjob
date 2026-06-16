import { z } from "zod";

export const CreateResumeFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Resume title is required.")
    .max(100, "Title must be less than 100 characters"),
});
