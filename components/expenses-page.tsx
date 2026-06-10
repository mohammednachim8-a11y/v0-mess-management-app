"use client"

import { useMemo, useState } from "react"
import { Plus, Sun, Moon } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, Badge, MetricCard, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"
import { FIXED_COST_PER_HEAD, countMeals, countMorning, countNight } from "@/lib/mess-data"

export function ExpensesPage() {
  const { members, mealData, expenses, addExpense, currentUser } = useMess()
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState("")
  const isManager = currentUser?.role === "manager"

  const { totalGrocery, totalMeals, rate } = useMemo(() => {
    const totalGrocery = expenses.reduce((a, e) => a + e.amount, 0)
    const totalMeals = members.reduce((a, m) => a + countMeals(mealData[m.id]), 0)
    const rate = totalMeals > 0 ? totalGrocery / totalMeals : 0
    return { totalGrocery, totalMeals, rate }
  }, [expenses, members, mealData])

  const submit = () => {
    const amt = Number.parseFloat(amount)
    if (!desc.trim() || Number.isNaN(amt)) return
    addExpense(desc.trim(), amt)
    setDesc("")
    setAmount("")
    setOpen(false)
  }

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total grocery" value={`৳${totalGrocery.toLocaleString()}`} sub="June 2025" />
        <MetricCard label="Total meals" value={String(totalMeals)} sub="Morning + night" />
        <MetricCard label="Per meal rate" value={`৳${rate.toFixed(1)}`} sub="Grocery ÷ meals" />
        <MetricCard label="Fixed / head" value={`৳${FIXED_COST_PER_HEAD}`} sub="Rent, gas, water" />
      </div>

      <Section
        title="Cost breakdown per member"
        action={
          isManager ? (
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add expense
            </PrimaryButton>
          ) : undefined
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Meals</th>
                <th className="px-3 py-3 font-medium">Meal cost</th>
                <th className="px-3 py-3 font-medium">Fixed</th>
                <th className="px-3 py-3 font-medium">Total due</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => {
                const meals = countMeals(mealData[m.id])
                const mealCost = Math.round(meals * rate)
                const total = mealCost + FIXED_COST_PER_HEAD
                const paid = idx % 2 === 0
                return (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <span>{meals}</span>
                        <span className="flex items-center gap-0.5 text-[11px]">
                          <Sun className="h-3 w-3" aria-hidden="true" />
                          {countMorning(mealData[m.id])}
                          <Moon className="ml-1 h-3 w-3" aria-hidden="true" />
                          {countNight(mealData[m.id])}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">৳{mealCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">৳{FIXED_COST_PER_HEAD}</td>
                    <td className="px-3 py-3 font-medium text-foreground">৳{total.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge tone={paid ? "success" : "danger"}>{paid ? "Paid" : "Pending"}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Grocery expenses" noPadding>
        <ul>
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
            >
              <span className="text-foreground">{e.desc}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{e.date}</span>
                <span className="font-medium text-foreground">৳{e.amount.toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Modal open={open} title="Add expense" onClose={() => setOpen(false)}>
        <Field label="Description">
          <input
            className={inputClass}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Grocery — week 4"
          />
        </Field>
        <Field label="Amount (৳)">
          <input
            className={inputClass}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1200"
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submit}>Add</PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
