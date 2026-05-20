"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function FormCard({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("fintech-surface rounded-[1.35rem]", className)}>
      <CardHeader className="px-6 text-center">
        {icon ? (
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-primary">
            {icon}
          </div>
        ) : null}
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-6 pb-6">{children}</CardContent>
    </Card>
  )
}

export function FormModal({
  title,
  description,
  trigger,
  children,
  className,
}: {
  title: string
  description?: string
  trigger: React.ReactNode
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[92svh] overflow-y-auto",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="px-6 pb-6">
          {typeof children === "function" ? children(close) : children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FormFieldShell({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="font-semibold">{label}</FieldLabel>
      {children}
      {hint && !error ? <FieldDescription>{hint}</FieldDescription> : null}
      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </Field>
  )
}

export function FormInput({
  label,
  error,
  hint,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string
  error?: string
  hint?: string
}) {
  return (
    <FormFieldShell label={label} error={error} hint={hint}>
      <Input
        aria-invalid={Boolean(error)}
        className={cn("h-12 rounded-xl px-4", className)}
        {...props}
      />
    </FormFieldShell>
  )
}

export function SubmitButton({
  loading,
  loadingText = "Processing...",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  loading?: boolean
  loadingText?: string
}) {
  return (
    <Button
      className={cn("h-12 rounded-xl", className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {loading ? loadingText : children}
    </Button>
  )
}

export function formatCurrencyInput(value: string) {
  const cleanValue = value.replace(/[^\d]/g, "")

  if (!cleanValue) return ""

  return new Intl.NumberFormat("en-NG").format(Number(cleanValue))
}

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const label = score <= 2 ? "Weak" : score <= 4 ? "Good" : "Strong"

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1.5">
        {checks.map((passed, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full bg-muted transition-colors",
              passed && "bg-primary"
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Password strength: <span className="text-foreground">{label}</span>
      </p>
    </div>
  )
}
