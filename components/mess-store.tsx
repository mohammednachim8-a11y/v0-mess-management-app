"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import {
  CREDENTIALS,
  type AuthUser,
  type Member,
  type MemberMeals,
  type ShoppingItem,
  type Notice,
  type Expense,
  type ExpenseKind,
  type Deposit,
  type Role,
  initialMembers,
  initialMealData,
  initialShopping,
  initialNotices,
  initialExpenses,
  initialDeposits,
  emptyMonth,
} from "@/lib/mess-data"

type MealSlot = "morning" | "night"

interface NewExpense {
  desc: string
  amount: number
  kind: ExpenseKind
  buyerId?: number
  category?: string
}

interface MessStore {
  currentUser: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void

  members: Member[]
  addMember: (name: string, room: string, role: Role) => void
  transferManager: (newManagerId: number) => void

  mealData: Record<number, MemberMeals>
  toggleMeal: (memberId: number, dayIdx: number, slot: MealSlot) => void
  setDay: (memberId: number, dayIdx: number, value: boolean) => void

  shopping: ShoppingItem[]
  addShoppingItem: (name: string) => void
  toggleShopping: (id: number) => void
  removeShopping: (id: number) => void

  notices: Notice[]
  addNotice: (text: string) => void
  removeNotice: (id: number) => void

  expenses: Expense[]
  addExpense: (e: NewExpense) => void

  deposits: Deposit[]
  addDeposit: (memberId: number, amount: number, date: string) => void

  toast: string | null
  showToast: (msg: string) => void
}

const Ctx = createContext<MessStore | null>(null)

export function MessProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [mealData, setMealData] = useState<Record<number, MemberMeals>>(initialMealData)
  const [shopping, setShopping] = useState<ShoppingItem[]>(initialShopping)
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout((showToast as unknown as { _t?: number })._t)
    ;(showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2500)
  }

  const value = useMemo<MessStore>(() => {
    return {
      currentUser,
      login: (username, password) => {
        const entry = CREDENTIALS[username.trim()]
        if (entry && entry.password === password.trim()) {
          setCurrentUser({ ...entry.user })
          return true
        }
        return false
      },
      logout: () => setCurrentUser(null),

      members,
      addMember: (name, room, role) => {
        setMembers((prev) => {
          const id = (prev.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1
          setMealData((md) => ({ ...md, [id]: emptyMonth() }))
          return [...prev, { id, name, room: room || "TBD", join: "June 2025", role, active: true }]
        })
        showToast("Member added")
      },
      transferManager: (newManagerId) => {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id === newManagerId) return { ...m, role: "manager" as Role }
            if (m.role === "manager") return { ...m, role: "member" as Role }
            return m
          }),
        )
        // Demote current user in session if they handed off the role.
        setCurrentUser((u) => {
          if (u && u.role === "manager" && u.memberId !== newManagerId) {
            return { ...u, role: "member" }
          }
          return u
        })
        showToast("Manager role transferred")
      },

      mealData,
      toggleMeal: (memberId, dayIdx, slot) => {
        setMealData((prev) => {
          const month = prev[memberId] ? [...prev[memberId]] : emptyMonth()
          month[dayIdx] = { ...month[dayIdx], [slot]: !month[dayIdx][slot] }
          return { ...prev, [memberId]: month }
        })
      },
      setDay: (memberId, dayIdx, val) => {
        setMealData((prev) => {
          const month = prev[memberId] ? [...prev[memberId]] : emptyMonth()
          month[dayIdx] = { morning: val, night: val }
          return { ...prev, [memberId]: month }
        })
      },

      shopping,
      addShoppingItem: (name) => {
        setShopping((prev) => [...prev, { id: Date.now(), name, done: false }])
        showToast("Item added")
      },
      toggleShopping: (id) =>
        setShopping((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))),
      removeShopping: (id) => {
        setShopping((prev) => prev.filter((i) => i.id !== id))
        showToast("Item removed")
      },

      notices,
      addNotice: (text) => {
        setNotices((prev) => [{ id: Date.now(), text, author: "Manager", time: "Just now" }, ...prev])
        showToast("Notice posted")
      },
      removeNotice: (id) => {
        setNotices((prev) => prev.filter((n) => n.id !== id))
        showToast("Notice removed")
      },

      expenses,
      addExpense: (e) => {
        setExpenses((prev) => [
          {
            id: Date.now(),
            desc: e.desc,
            amount: e.amount,
            date: "Today",
            kind: e.kind,
            buyerId: e.buyerId,
            category: e.category,
          },
          ...prev,
        ])
        showToast(`${e.kind === "bill" ? "Bill" : "Grocery"} added: Tk ${e.amount.toLocaleString()}`)
      },

      deposits,
      addDeposit: (memberId, amount, date) => {
        setDeposits((prev) => [{ id: Date.now(), memberId, amount, date: date || "Today" }, ...prev])
        showToast(`Deposit added: Tk ${amount.toLocaleString()}`)
      },

      toast,
      showToast,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, members, mealData, shopping, notices, expenses, deposits, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMess() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useMess must be used within MessProvider")
  return ctx
}
