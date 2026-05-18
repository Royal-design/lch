import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Enter your password")
    .min(6, "Password is too short"),

  rememberMe: z.boolean().optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Enter your full name")
      .min(2, "Enter your full name"),

    email: z.email("Enter a valid email address"),

    phone: z
      .string()
      .min(1, "Enter your phone number")
      .regex(/^\+?[0-9\s-]{8,15}$/, "Enter a valid phone number"),

    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add one uppercase letter")
      .regex(/[a-z]/, "Add one lowercase letter")
      .regex(/\d/, "Add one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Add one special character"),

    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })

export const registerSchema2 = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters"),

  email: z.email("Invalid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s-]{8,15}$/, "Enter a valid phone number"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include a special character"),
})

export type RegisterSchema = z.infer<typeof registerSchema>

const amountString = z
  .string()
  .min(1, "Enter an amount")
  .transform((value) => Number(value.replace(/[^\d.]/g, "")))
  .pipe(
    z
      .number("Enter a valid amount")
      .positive("Amount must be above zero")
      .finite("Enter a valid amount")
  )

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const contributionPlanSchema = z.object({
  planType: z.enum(["ajo", "personal"], {
    error: "Choose a plan type",
  }),
  planName: z
    .string()
    .min(1, "Enter a plan name")
    .min(3, "Use a clearer plan name"),
  targetAmount: amountString.refine((amount) => amount >= 1000, {
    message: "Target must be at least NGN 1,000",
  }),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    error: "Choose a contribution frequency",
  }),
  withdrawalAccess: z.enum(["anytime", "maturity", "owner-controlled"], {
    error: "Choose withdrawal access",
  }),
  lockDuration: z
    .string()
    .min(1, "Choose a lock preference")
    .transform((value) => Number(value))
    .pipe(
      z
        .number("Choose a valid duration")
        .int("Choose a valid duration")
        .min(1, "Lock for at least 1 month")
        .max(36, "Lock duration is too long")
    ),
  description: z.string().max(140, "Keep this under 140 characters").optional(),
})

export type ContributionPlanSchema = z.input<typeof contributionPlanSchema>
export type ContributionPlanValues = z.output<typeof contributionPlanSchema>

export const addContributionSchema = z.object({
  amount: amountString.refine((amount) => amount >= 500, {
    message: "Minimum contribution is NGN 500",
  }),
  planId: z.string().min(1, "Choose a contribution plan"),
})

export type AddContributionSchema = z.input<typeof addContributionSchema>
export type AddContributionValues = z.output<typeof addContributionSchema>

export const depositSchema = z.object({
  amount: amountString.refine((amount) => amount >= 500, {
    message: "Minimum deposit is NGN 500",
  }),
  source: z.string().min(1, "Choose a funding source"),
})

export type DepositSchema = z.input<typeof depositSchema>
export type DepositValues = z.output<typeof depositSchema>

export const withdrawalRequestSchema = z.object({
  amount: amountString.refine((amount) => amount <= 522500, {
    message: "Amount exceeds available balance",
  }),
  reason: z.string().max(120, "Keep this under 120 characters").optional(),
})

export type WithdrawalRequestSchema = z.input<typeof withdrawalRequestSchema>
export type WithdrawalRequestValues = z.output<typeof withdrawalRequestSchema>
