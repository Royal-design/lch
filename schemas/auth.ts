import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include a special character"),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
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

    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
