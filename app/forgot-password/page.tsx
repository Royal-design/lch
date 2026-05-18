"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { LchLogo } from "@/components/lch-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordSchema) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: origin ? `${origin}/login` : undefined,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Password reset email sent.")
  }

  return (
    <main className="fintech-page flex min-h-svh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <LchLogo />
          <ModeToggle />
        </div>
        <Card className="fintech-surface rounded-lg">
          <CardHeader className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-lg bg-accent text-primary">
              <Mail className="size-5" />
            </div>
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>
              Enter your email and we will send secure recovery instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-12 rounded-lg bg-background px-4"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-12 rounded-lg"
                >
                  {form.formState.isSubmitting
                    ? "Sending..."
                    : "Send reset link"}
                </Button>
                <Button asChild variant="link" className="text-primary">
                  <Link href="/login">Back to login</Link>
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
