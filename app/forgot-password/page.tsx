"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  FormCard,
  FormInput,
  SubmitButton,
} from "@/components/forms/form-system"
import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/schemas/auth"

type ForgotPasswordResponse = {
  message: string
}

type ErrorResponse = {
  error?: string
}

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const response = await axios.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        data
      )

      toast.success(response.data.message)
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      toast.error(error.response?.data?.error ?? "Unable to send reset link")
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
          title="Reset password"
          description="Enter the email linked to your LCH account. We will send reset instructions if the account exists."
          icon={<Mail className="size-5" />}
        >
            <form
              method="post"
              action="/api/auth/forgot-password"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup>
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
                <SubmitButton
                  type="submit"
                  loading={form.formState.isSubmitting}
                  loadingText="Preparing link..."
                >
                  Send reset link
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
