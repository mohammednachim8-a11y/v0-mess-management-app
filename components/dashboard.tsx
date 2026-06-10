"use client"

import { useMemo } from "react"
import { Sun, Moon } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, MetricCard } from "@/components/ui-bits"
import { MONTH_LABEL, FIXED_COST_PER_HEAD, countMeals, countMorning, countNight } from "@/lib/mess-data"

export function Dashboard({ goTo }: { goTo: (page: string) => void }) {
  const { members, mealData, expenses, notices } = useMess()

  const stats = useMemo(() => {
    const totalMeals = members.reduce((a, m) => a + countMeals(mealData[m.id]), 0)
    const morning = members.reduce((a, m) => a + countMorning(mealData[m.id]), 0)
    const night = members.reduce((a, m) => a + countNight(mealData[m.id]), 0)
    const totalExpense = expenses.reduce((a, e) => a + e.amount, 0)
    const rate = totalMeals > 0 ? totalExpense / totalMeals : 0
    return { totalMeals, morning, night, totalExpense, rate }
  }, [members, mealData, expenses])

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total members" value={String(members.length)} sub="Active this month" />
        <MetricCard label="Meals this month" value={String(stats.totalMeals)} sub="Morning + night" />
        <MetricCard label="Total expense" value={`৳${stats.totalExpense.toLocaleString()}`} sub={MONTH_LABEL} />
        <MetricCard label="Per meal rate" value={`৳${stats.rate.toFixed(1)}`} sub="This month" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Meals by slot">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                <Sun className="h-4 w-4" aria-hidden="true" /> Morning meals
              </div>
              <p className="mt-2 text-2xl font-medium text-foreground">{stats.morning}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                <Moon className="h-4 w-4" aria-hidden="true" /> Night meals
              </div>
              <p className="mt-2 text-2xl font-medium text-foreground">{stats.night}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Each day offers 2 meals (morning + night). Members can opt in or out of each meal
            independently.
          </p>
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

      <Section title={`Meal share — ${MONTH_LABEL}`} noPadding>
        <ul>
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Sun className="h-3 w-3" aria-hidden="true" /> {countMorning(mealData[m.id])}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Moon className="h-3 w-3" aria-hidden="true" /> {countNight(mealData[m.id])}
                  </span>
                  <span>· {countMeals(mealData[m.id])} meals</span>
                </p>
              </div>
              <span className="font-medium text-foreground">
                ৳{Math.round(countMeals(mealData[m.id]) * stats.rate + FIXED_COST_PER_HEAD).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
