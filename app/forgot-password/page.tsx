"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 650))
    toast.success(`Recovery flow validated for ${data.email}.`)
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
          description="Enter your email and we will send secure recovery instructions."
          icon={<Mail className="size-5" />}
        >
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
