"use client"

import { useState } from "react"
import { Sun, Moon } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { MONTH_LABEL, countMeals, countMorning, countNight, type DayMeals } from "@/lib/mess-data"
import { Section } from "@/components/ui-bits"

function MealToggle({
  on,
  canEdit,
  onClick,
  label,
  icon: Icon,
}: {
  on: boolean
  canEdit: boolean
  onClick: () => void
  label: string
  icon: typeof Sun
}) {
  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className={[
        "flex flex-1 items-center justify-center gap-1 rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors",
        canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default",
        on
          ? "border-success bg-success-muted text-success"
          : "border-border bg-card text-muted-foreground",
      ].join(" ")}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {on ? "On" : "Off"}
    </button>
  )
}

export function MealTracker() {
  const { members, mealData, toggleMeal, setDay, currentUser } = useMess()
  const [selected, setSelected] = useState<number>(members[0]?.id ?? 1)
  const canEdit = currentUser?.role === "manager"
  const days = mealData[selected] ?? []

  const totalMeals = countMeals(days)
  const morningTotal = countMorning(days)
  const nightTotal = countNight(days)

  const allOn = days.length > 0 && days.every((d) => d.morning && d.night)

  const toggleAll = () => {
    days.forEach((_, i) => setDay(selected, i, !allOn))
  }

  return (
    <Section
      title={`${MONTH_LABEL} — meal tracker`}
      action={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Morning
          </span>
          <span className="flex items-center gap-1">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" /> Night
          </span>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m.id)}
            className={[
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              m.id === selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary",
            ].join(" ")}
          >
            {m.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-3 text-xs">
          <span className="rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
            Total meals: <b>{totalMeals}</b>
          </span>
          <span className="flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
            <Sun className="h-3 w-3" aria-hidden="true" /> {morningTotal}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-secondary-foreground">
            <Moon className="h-3 w-3" aria-hidden="true" /> {nightTotal}
          </span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={toggleAll}
            className="ml-auto rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {allOn ? "Turn all off" : "Turn all on"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {days.map((d: DayMeals, i: number) => (
          <div key={i} className="rounded-lg border border-border bg-card p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Day {i + 1}</span>
              <span className="text-[10px] text-muted-foreground">
                {(d.morning ? 1 : 0) + (d.night ? 1 : 0)}/2
              </span>
            </div>
            <div className="flex gap-1.5">
              <MealToggle
                label={`Day ${i + 1} morning meal`}
                icon={Sun}
                on={d.morning}
                canEdit={canEdit}
                onClick={() => toggleMeal(selected, i, "morning")}
              />
              <MealToggle
                label={`Day ${i + 1} night meal`}
                icon={Moon}
                on={d.night}
                canEdit={canEdit}
                onClick={() => toggleMeal(selected, i, "night")}
              />
            </div>
          </div>
        ))}
      </div>

      {!canEdit && (
        <p className="mt-3 text-xs text-muted-foreground">
          Only the manager can edit meals. You are viewing in read-only mode.
        </p>
      )}
    </Section>
  )
}
