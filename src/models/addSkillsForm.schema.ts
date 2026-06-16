import { z } from "zod";

export const AddSkillsFormSchema = z.object({
  id: z.string().optional(),
  resumeId: z.string().optional(),
  label: z.string().min(1, "Category is required."),
  details: z.array(z.string().min(1)).min(1, "At least one skill is required."),
});
