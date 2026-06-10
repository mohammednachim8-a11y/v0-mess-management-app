"use client"

import { useMemo, useState } from "react"
import { Plus, ShoppingBag, Receipt, Wallet } from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Section, Badge, MetricCard, PrimaryButton, Modal, Field, inputClass } from "@/components/ui-bits"
import {
  type ExpenseKind,
  groceryTotal,
  billTotal,
  countMeals,
  memberFinance,
} from "@/lib/mess-data"

export function ExpensesPage() {
  const { members, mealData, expenses, deposits, addExpense, addDeposit, currentUser } = useMess()
  const [open, setOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)

  // expense form state
  const [kind, setKind] = useState<ExpenseKind>("grocery")
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState("")
  const [buyerId, setBuyerId] = useState<string>("")
  const [category, setCategory] = useState("")

  // deposit form state
  const [depMember, setDepMember] = useState<string>("")
  const [depAmount, setDepAmount] = useState("")
  const [depDate, setDepDate] = useState("")

  const isManager = currentUser?.role === "manager"

  const { grocery, bills, totalMeals, rate, billShare } = useMemo(() => {
    const grocery = groceryTotal(expenses)
    const bills = billTotal(expenses)
    const totalMeals = members.reduce((a, m) => a + countMeals(mealData[m.id]), 0)
    const rate = totalMeals > 0 ? grocery / totalMeals : 0
    const activeCount = members.filter((m) => m.active).length || members.length || 1
    const billShare = Math.round(bills / activeCount)
    return { grocery, bills, totalMeals, rate, billShare }
  }, [expenses, members, mealData])

  const submitExpense = () => {
    const amt = Number.parseFloat(amount)
    if (!desc.trim() || Number.isNaN(amt) || amt <= 0) return
    if (kind === "grocery" && !buyerId) return
    addExpense({
      desc: desc.trim(),
      amount: amt,
      kind,
      buyerId: kind === "grocery" ? Number(buyerId) : undefined,
      category: kind === "bill" ? category.trim() || "General" : undefined,
    })
    setDesc("")
    setAmount("")
    setBuyerId("")
    setCategory("")
    setKind("grocery")
    setOpen(false)
  }

  const submitDeposit = () => {
    const amt = Number.parseFloat(depAmount)
    if (!depMember || Number.isNaN(amt) || amt <= 0) return
    addDeposit(Number(depMember), amt, depDate.trim())
    setDepMember("")
    setDepAmount("")
    setDepDate("")
    setDepositOpen(false)
  }

  const buyerName = (id?: number) => members.find((m) => m.id === id)?.name ?? "—"

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total grocery" value={`Tk ${grocery.toLocaleString()}`} sub="Split by meals" />
        <MetricCard label="Total bills" value={`Tk ${bills.toLocaleString()}`} sub={`Tk ${billShare} / head`} />
        <MetricCard label="Total meals" value={String(totalMeals)} sub="Morning + night" />
        <MetricCard label="Per meal rate" value={`Tk ${rate.toFixed(1)}`} sub="Grocery ÷ meals" />
      </div>

      <Section
        title="Cost breakdown per member"
        action={
          isManager ? (
            <div className="flex gap-2">
              <PrimaryButton onClick={() => setDepositOpen(true)}>
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Add deposit
              </PrimaryButton>
              <PrimaryButton onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add expense
              </PrimaryButton>
            </div>
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
                <th className="px-3 py-3 font-medium">Bill share</th>
                <th className="px-3 py-3 font-medium">Deposited</th>
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
                    <td className="px-3 py-3 text-muted-foreground">Tk {f.mealCost.toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">Tk {f.billShare.toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">Tk {f.deposited.toLocaleString()}</td>
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
        <Section title="Expenses" noPadding>
          <ul>
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-0"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
                    {e.kind === "bill" ? (
                      <Receipt className="h-4 w-4" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-foreground">{e.desc}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.kind === "bill" ? (
                        <>Bill · {e.category} · split evenly</>
                      ) : (
                        <>Grocery · bought by {buyerName(e.buyerId)}</>
                      )}
                    </p>
                  </div>
                </div>
                <span className="flex flex-col items-end">
                  <span className="font-medium text-foreground">Tk {e.amount.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Deposits" noPadding>
          <ul>
            {deposits.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
              >
                <span className="text-foreground">{buyerName(d.memberId)}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{d.date}</span>
                  <span className="font-medium text-success">+Tk {d.amount.toLocaleString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Add expense modal */}
      <Modal open={open} title="Add expense" onClose={() => setOpen(false)}>
        <Field label="Type">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind("grocery")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${
                kind === "grocery"
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> Grocery
            </button>
            <button
              type="button"
              onClick={() => setKind("bill")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${
                kind === "bill"
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" aria-hidden="true" /> Bill
            </button>
          </div>
        </Field>

        <Field label={kind === "grocery" ? "What was bought" : "Bill description"}>
          <input
            className={inputClass}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={kind === "grocery" ? "e.g. Rice 10kg, fish, onion" : "e.g. Electricity bill June"}
          />
        </Field>

        {kind === "grocery" ? (
          <Field label="Bought by">
            <select className={inputClass} value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Category">
            <input
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electricity, Gas, Water, Internet"
            />
          </Field>
        )}

        <Field label="Amount (Tk)">
          <input
            className={inputClass}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1200"
          />
        </Field>

        <p className="mb-2 text-xs text-muted-foreground">
          {kind === "grocery"
            ? "Grocery cost is shared based on each member's meal count."
            : "Bills are split evenly across all active members."}
        </p>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submitExpense}>Add</PrimaryButton>
        </div>
      </Modal>

      {/* Add deposit modal */}
      <Modal open={depositOpen} title="Add deposit" onClose={() => setDepositOpen(false)}>
        <Field label="Member">
          <select className={inputClass} value={depMember} onChange={(e) => setDepMember(e.target.value)}>
            <option value="">Select member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (Tk)">
          <input
            className={inputClass}
            type="number"
            value={depAmount}
            onChange={(e) => setDepAmount(e.target.value)}
            placeholder="e.g. 2000"
          />
        </Field>
        <Field label="Date (optional)">
          <input
            className={inputClass}
            value={depDate}
            onChange={(e) => setDepDate(e.target.value)}
            placeholder="e.g. 15 Jun"
          />
        </Field>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDepositOpen(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submitDeposit}>Add deposit</PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
