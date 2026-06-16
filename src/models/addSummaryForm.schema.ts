import { z } from "zod";

export const AddSummarySectionFormSchema = z.object({
  resumeId: z.string().optional(),
  content: z
    .string({
      error: "Summary content is required",
    })
    .min(10),
});
