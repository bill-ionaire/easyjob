import { z } from "zod";

export const AddContactInfoFormSchema = z.object({
  resumeId: z.string().optional(),
  firstName: z
    .string({
      error: "First Name is required.",
    })
    .min(2, {
      message: "First name must be at least 2 characters.",
    }),
  lastName: z
    .string({
      error: "Last Name is required.",
    })
    .min(2, {
      message: "Last name must be at least 2 characters.",
    }),
  headline: z
    .string({
      error: "Headline is required.",
    })
    .min(2, {
      message: "Headline must be at least 2 characters.",
    }),
  email: z
    .string({
      error: "Email is required!",
    })
    .email("Please enter a valid email!"),
  phone: z.string({
    error: "Phone is required!",
  }),
  address: z.string().optional(),
});
