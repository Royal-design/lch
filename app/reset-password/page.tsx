"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  FormCard,
  FormFieldShell,
  PasswordStrength,
  SubmitButton,
} from "@/components/forms/form-system"
import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/schemas/auth"

type ErrorResponse = {
  error?: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await axios.post("/api/auth/reset-password", data)
      toast.success("Password updated. You can log in with it now.")
      router.replace("/login?message=password-reset")
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      toast.error(error.response?.data?.error ?? "Unable to reset password")
    }
  }

  return (
    <main className="fintech-page flex min-h-svh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <LchLogo />
          <ModeToggle />
        </div>
        <FormCard
          title="Choose a new password"
          description="Use a strong password to secure your LCH account."
          icon={<LockKeyhole className="size-5" />}
        >
          <form
            method="post"
            action="/api/auth/reset-password"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormFieldShell
                    label="New password"
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
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                        <span className="sr-only">
                          Toggle password visibility
                        </span>
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
                    label="Confirm new password"
                    error={fieldState.error?.message}
                  >
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        className="h-12 rounded-xl px-4 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl"
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
                loading={form.formState.isSubmitting}
                loadingText="Updating password..."
              >
                Update password
              </SubmitButton>
              <Button asChild variant="link" className="text-primary">
                <Link href="/login">Back to login</Link>
              </Button>
            </FieldGroup>
          </form>
        </FormCard>
      </div>
    </main>
  )
}
