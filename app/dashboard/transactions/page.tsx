"use client"

import { ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const rows = [
  ["Monthly contribution", "+NGN 50,000", "Successful", "Today, 9:24 AM", "in"],
  ["Wallet withdrawal", "-NGN 18,500", "Processing", "Yesterday, 6:12 PM", "out"],
  ["Locked savings transfer", "NGN 120,000", "Locked", "May 16, 2026", "in"],
  ["Ajo contribution", "+NGN 25,000", "Successful", "May 15, 2026", "in"],
]

export default function TransactionsPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredRows = rows.filter(([title, amount, status, time, type]) => {
    const searchable = `${title} ${amount} ${status} ${time}`.toLowerCase()
    const matchesQuery = searchable.includes(query.toLowerCase())
    const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter
    const matchesType = typeFilter === "all" || type === typeFilter

    return matchesQuery && matchesStatus && matchesType
  })

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Transaction tracking
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Activity ledger
          </h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-[16rem_10rem_9rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ledger"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl bg-card/75 px-3">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl bg-card/75 px-3">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All type</SelectItem>
              <SelectItem value="in">Inflow</SelectItem>
              <SelectItem value="out">Outflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="fintech-surface rounded-[1.35rem]">
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredRows.map(([title, amount, status, time, type]) => (
            <div
              key={`${title}-${time}`}
              className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/20 hover:bg-card sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                  {type === "out" ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownLeft className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{title}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                <span className="status-pill">{status}</span>
                <p className="min-w-28 text-sm font-bold">{amount}</p>
              </div>
            </div>
          ))}
          {filteredRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Filter className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">No matching transactions</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or clear one of the filters.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
