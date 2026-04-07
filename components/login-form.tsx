"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginSchema } from "@/schemas/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import SocialLogin from "./social-login"

export function LoginForm() {

  const [loading, setLoading] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  type ErrorResponse = {
    error?: string
  }

  const onSubmit = async (data: LoginSchema) => {
    try {
      setLoading(true)

      await axios.post("/api/auth/login", data)

      window.location.href = "/dashboard"
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>

      const message = error.response?.data?.error || "Something went wrong"

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Kindly login to your account to continue where you left off.
            We&apos;re excited to have you back!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <SocialLogin />

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>

          <form
            method="POST"
            id="login-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4"
          >
            <FieldGroup>
              {/* EMAIL */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>

                    <Input
                      {...field}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="py-5"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* PASSWORD */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password</FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="py-5"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* BUTTON */}
              <Button type="submit" disabled={loading} className="p-5">
                {loading ? "Logging in..." : "Login"}
              </Button>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
