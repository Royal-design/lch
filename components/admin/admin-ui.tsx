"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function AdminPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const value = status.toLowerCase()

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold",
        ["active", "successful", "approved", "delivered", "completed"].includes(value) &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200",
        ["pending", "processing", "queued"].includes(value) &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-200",
        ["rejected", "suspended", "failed", "flagged", "locked"].includes(value) &&
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/10 dark:text-rose-200"
      )}
    >
      {status}
    </span>
  )
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend: string
}) {
  return (
    <Card className="fintech-surface rounded-[1.1rem]">
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="grid size-8 sm:size-11 place-items-center rounded-xl sm:rounded-2xl bg-accent text-primary">
            <Icon className="size-4 sm:size-5" />
          </div>
          <span className="status-pill text-[0.6rem] sm:text-[0.68rem] px-2 sm:px-2.5">{trend}</span>
        </div>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-muted-foreground line-clamp-1">
          {label}
        </p>
        <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

export function AdminDataTable({
  title,
  columns,
  rows,
  statusIndex,
  searchable = true,
  filterLabel = "Status",
}: {
  title: string
  columns: string[]
  rows: string[][]
  statusIndex?: number
  searchable?: boolean
  filterLabel?: string
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const statuses = useMemo(
    () =>
      statusIndex === undefined
        ? []
        : Array.from(new Set(rows.map((row) => row[statusIndex]))),
    [rows, statusIndex]
  )
  const filteredRows = rows.filter((row) => {
    const matchesQuery = row.join(" ").toLowerCase().includes(query.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (statusIndex !== undefined && row[statusIndex].toLowerCase() === filter)

    return matchesQuery && matchesFilter
  })

  return (
    <Card className="fintech-surface rounded-[1.35rem]">
      <CardHeader className="gap-3">
        <CardTitle>{title}</CardTitle>
        <div className="grid gap-2 sm:grid-cols-[1fr_11rem]">
          {searchable ? (
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
              className="h-10 rounded-xl"
            />
          ) : (
            <div />
          )}
          {statusIndex !== undefined ? (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-card/75 px-3">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All {filterLabel.toLowerCase()}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status.toLowerCase()}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {columns.map((column) => (
                  <th key={column} className="px-3 py-3 font-bold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.join("-")} className="border-b border-border/70 last:border-0">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="px-3 py-4">
                      {index === statusIndex ? <StatusBadge status={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No records match the current filters.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function WithdrawalActions({ status }: { status: string }) {
  const disabled = status !== "Pending"

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={disabled}
        className="rounded-xl"
        onClick={() => toast.success("Withdrawal approved.")}
      >
        <CheckCircle2 className="size-3.5" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        className="rounded-xl"
        onClick={() => toast.error("Withdrawal rejected with reason saved.")}
      >
        <XCircle className="size-3.5" />
        Reject
      </Button>
    </div>
  )
}
