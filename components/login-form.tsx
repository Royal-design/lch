"use client"

import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import {
  FormCard,
  FormFieldShell,
  FormInput,
  SubmitButton,
} from "./forms/form-system"
import SocialLogin from "./social-login"

type LoginResponse = {
  redirectTo?: string
}

type ErrorResponse = {
  error?: string
}

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { user, role, loading, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && !loading && user) {
      router.replace(role === "admin" ? "/admin" : "/dashboard")
    }
  }, [initialized, loading, user, role, router])

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", data)

      toast.success("Login successful.")
      router.refresh()
      router.replace(response.data.redirectTo ?? "/dashboard")
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      toast.error(error.response?.data?.error ?? "Unable to login")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FormCard
        title="Welcome back"
        description="Login to manage your wallet, contributions, and savings plans."
      >
          <SocialLogin />

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card *:data-[slot=field-separator-content]:text-muted-foreground">
            Or continue with
          </FieldSeparator>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4"
          >
            <FieldGroup>
              {/* EMAIL */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormInput
                    {...field}
                    type="email"
                    label="Email"
                    error={fieldState.error?.message}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
              />

              {/* PASSWORD */}
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
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                  </FormFieldShell>
                )}
              />

              <div className="flex items-center justify-between gap-3">
                <Controller
                  name="rememberMe"
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(field.value)}
                        onChange={field.onChange}
                        className="size-4 rounded border-border accent-primary"
                      />
                      Remember me
                    </label>
                  )}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* BUTTON */}
              <SubmitButton
                type="submit"
                loading={form.formState.isSubmitting}
                loadingText="Checking details..."
                disabled={!form.formState.isValid && form.formState.isSubmitted}
              >
                Login
              </SubmitButton>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary underline">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
      </FormCard>
    </div>
  )
}
