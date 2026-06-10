"use client"

import { useMemo } from "react"
import { useMess } from "@/components/mess-store"
import { Section, MetricCard, Badge } from "@/components/ui-bits"
import {
  MONTH_LABEL,
  countMeals,
  groceryTotal,
  billTotal,
  memberFinance,
} from "@/lib/mess-data"

export function Dashboard({ goTo }: { goTo: (page: string) => void }) {
  const { members, mealData, expenses, deposits, notices } = useMess()

  const stats = useMemo(() => {
    const totalMeals = members.reduce((a, m) => a + countMeals(mealData[m.id]), 0)
    const grocery = groceryTotal(expenses)
    const bills = billTotal(expenses)
    const totalExpense = grocery + bills
    const totalDeposit = deposits.reduce((a, d) => a + d.amount, 0)
    const rate = totalMeals > 0 ? grocery / totalMeals : 0
    return { totalMeals, grocery, bills, totalExpense, totalDeposit, rate }
  }, [members, mealData, expenses, deposits])

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total members" value={String(members.length)} sub="Active this month" />
        <MetricCard label="Total meals" value={String(stats.totalMeals)} sub={MONTH_LABEL} />
        <MetricCard label="Total deposit" value={`Tk ${stats.totalDeposit.toLocaleString()}`} sub="Collected" />
        <MetricCard label="Per meal rate" value={`Tk ${stats.rate.toFixed(1)}`} sub="Grocery ÷ meals" />
      </div>

      <Section title={`Member balances — ${MONTH_LABEL}`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Meals</th>
                <th className="px-3 py-3 font-medium">Deposited</th>
                <th className="px-3 py-3 font-medium">Cost</th>
                <th className="px-3 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const f = memberFinance(m.id, members, mealData, expenses, deposits)
                return (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{f.meals}</td>
                    <td className="px-3 py-3 text-muted-foreground">Tk {f.deposited.toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">Tk {f.totalCost.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge tone={f.balance >= 0 ? "success" : "danger"}>
                        {f.balance >= 0 ? "+" : "−"}Tk {Math.abs(f.balance).toLocaleString()}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Money summary">
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Grocery spent</span>
              <span className="font-medium text-foreground">Tk {stats.grocery.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Bills (split evenly)</span>
              <span className="font-medium text-foreground">Tk {stats.bills.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-muted-foreground">Total deposit</span>
              <span className="font-medium text-foreground">Tk {stats.totalDeposit.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Mess balance</span>
              <span className="font-medium text-foreground">
                Tk {(stats.totalDeposit - stats.totalExpense).toLocaleString()}
              </span>
            </li>
          </ul>
        </Section>

        <Section
          title="Recent notices"
          action={
            <button
              type="button"
              onClick={() => goTo("notices")}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary"
            >
              View all
            </button>
          }
        >
          <ul className="flex flex-col">
            {notices.slice(0, 3).map((n) => (
              <li key={n.id} className="flex gap-3 border-b border-border py-2.5 last:border-0">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm leading-relaxed text-foreground">{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.time} · {n.author}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  )
}
