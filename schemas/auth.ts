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

export const resetPasswordSchema = z
  .object({
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

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "Enter your full name")
    .max(80, "Full name is too long"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{8,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.url("Enter a valid avatar URL").optional().or(z.literal("")),
})

export const userStatusUpdateSchema = z.object({
  status: z.enum(["active", "suspended"]),
})

export const userRoleUpdateSchema = z.object({
  role: z
    .string()
    .min(2, "Choose a valid role")
    .max(40, "Role name is too long")
    .regex(/^[a-z][a-z0-9_]*$/, "Choose a valid role"),
})

export const roleCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Enter a role name")
    .max(40, "Role name is too long")
    .transform((value) => value.toLowerCase().trim().replace(/\s+/g, "_")),
  display_name: z
    .string()
    .min(2, "Enter a display name")
    .max(60, "Display name is too long"),
  description: z.string().max(160, "Description is too long").optional(),
})

export const roleUpdateSchema = z.object({
  display_name: z
    .string()
    .min(2, "Enter a display name")
    .max(60, "Display name is too long"),
  description: z.string().max(160, "Description is too long").optional(),
})

export const ajoTypeSchema = z.object({
  name: z
    .string()
    .min(2, "Enter a type name")
    .max(60, "Type name is too long")
    .transform((value) => value.toLowerCase().trim().replace(/\s+/g, "_")),
  plan_name: z
    .string()
    .min(3, "Enter a plan name")
    .max(80, "Plan name is too long"),
  description: z.string().max(180, "Description is too long").optional(),
  target_amount: z.number().positive("Target amount must be above zero"),
  min_contribution: z
    .number()
    .positive("Minimum contribution must be above zero"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  withdrawal_access: z.enum(["anytime", "maturity", "owner-controlled"]),
  lock_duration_months: z
    .number()
    .int()
    .min(1, "Lock duration must be at least 1 month")
    .max(36, "Lock duration is too long"),
  member_limit: z.number().int().min(2, "Member limit must be at least 2"),
  status: z.enum(["active", "paused", "closed"]).default("active"),
})

export const ajoTypeUpdateSchema = ajoTypeSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update"
)

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
