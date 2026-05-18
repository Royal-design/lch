"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { registerSchema, type RegisterSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import {
  FormCard,
  FormFieldShell,
  FormInput,
  PasswordStrength,
  SubmitButton,
} from "./forms/form-system"

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, role, loading: authLoading, initialized } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !authLoading && user) {
      router.replace(role === "admin" ? "/admin" : "/dashboard")
    }
  }, [initialized, authLoading, user, role, router])

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterSchema) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLoading(false)
    toast.success(`${data.fullName.split(" ")[0] || "Account"} is ready for Week 2 integration.`)
  }

  return (
    <FormCard
      title="Create your LCH account"
      description="Start with secure access to contribution plans and wallet tracking."
    >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormInput
                  {...field}
                  label="Full name"
                  error={fieldState.error?.message}
                  autoComplete="name"
                  placeholder="Amina Yusuf"
                />
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormInput
                    {...field}
                    type="email"
                    label="Email"
                    error={fieldState.error?.message}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormInput
                    {...field}
                    type="tel"
                    label="Phone number"
                    error={fieldState.error?.message}
                    autoComplete="tel"
                    placeholder="+234 801 234 5678"
                  />
                )}
              />
            </div>

            <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                <FormFieldShell
                  label="Password"
                  error={fieldState.error?.message}
                >
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className="h-12 rounded-xl px-4 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                  <PasswordStrength password={field.value} />
                </FormFieldShell>
              )}
            />

            <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                <FormFieldShell
                  label="Confirm password"
                  error={fieldState.error?.message}
                >
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className="h-12 rounded-xl px-4 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">
                        Toggle confirm password visibility
                      </span>
                    </Button>
                  </div>
                </FormFieldShell>
              )}
            />

            <SubmitButton
              type="submit"
              disabled={loading}
              loading={loading}
              loadingText="Creating account..."
            >
              Create account
            </SubmitButton>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary underline">
                Login
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
    </FormCard>
  )
}
