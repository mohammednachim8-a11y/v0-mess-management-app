"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import {
  CREDENTIALS,
  type AuthUser,
  type Member,
  type MemberMeals,
  type Notice,
  type Expense,
  type ExpenseKind,
  type Deposit,
  type Role,
  initialMembers,
  initialMealData,
  initialNotices,
  initialExpenses,
  initialDeposits,
  MESS_NAME,
  emptyMonth,
} from "@/lib/mess-data"

type MealSlot = "morning" | "night"

interface NewExpense {
  desc: string
  amount: number
  kind: ExpenseKind
  date: string
  time: string
  imageUrl?: string
  buyerId?: number
  category?: string
}

interface MessStore {
  currentUser: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => boolean
  updateUserPassword: (username: string, newPassword: string) => void

  messName: string
  setMessName: (name: string) => void

  members: Member[]
  addMember: (name: string, room: string, role: Role) => void
  deleteMember: (memberId: number) => void
  transferManager: (newManagerId: number) => void

  mealData: Record<number, MemberMeals>
  toggleMeal: (memberId: number, dayIdx: number, slot: MealSlot) => void
  setDay: (memberId: number, dayIdx: number, value: boolean) => void

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
  const [messName, setMessName] = useState(MESS_NAME)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [mealData, setMealData] = useState<Record<number, MemberMeals>>(initialMealData)
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits)
  const [toast, setToast] = useState<string | null>(null)
  const [credentials, setCredentials] = useState(CREDENTIALS)

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout((showToast as unknown as { _t?: number })._t)
    ;(showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2500)
  }

  const value = useMemo<MessStore>(() => {
    return {
      currentUser,
      login: (username, password) => {
        const entry = credentials[username.trim()]
        if (entry && entry.password === password.trim()) {
          setCurrentUser({ ...entry.user })
          return true
        }
        return false
      },
      logout: () => setCurrentUser(null),
      changePassword: (oldPassword, newPassword) => {
        if (!currentUser) return false
        const entry = credentials[currentUser.key]
        if (!entry || entry.password !== oldPassword.trim()) {
          showToast("Current password is incorrect")
          return false
        }
        setCredentials((prev) => ({
          ...prev,
          [currentUser.key]: {
            ...prev[currentUser.key],
            password: newPassword.trim(),
          },
        }))
        showToast("Password changed successfully")
        return true
      },
      updateUserPassword: (username, newPassword) => {
        setCredentials((prev) => ({
          ...prev,
          [username]: {
            ...prev[username],
            password: newPassword.trim(),
          },
        }))
      },

      messName,
      setMessName: (name) => {
        if (name.trim()) {
          setMessName(name.trim())
          showToast("Mess name updated")
        }
      },

      members,
      addMember: (name, room, role) => {
        setMembers((prev) => {
          const id = (prev.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1
          setMealData((md) => ({ ...md, [id]: emptyMonth() }))
          return [...prev, { id, name, room: room || "TBD", join: "June 2025", role, active: true }]
        })
        showToast("Member added")
      },
      deleteMember: (memberId) => {
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        setMealData((prev) => {
          const newMealData = { ...prev }
          delete newMealData[memberId]
          return newMealData
        })
        showToast("Member removed")
      },
      transferManager: (newManagerId) => {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id === newManagerId) return { ...m, role: "manager" as Role }
            if (m.role === "manager") return { ...m, role: "member" as Role }
            return m
          }),
        )
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
            date: e.date || "Today",
            time: e.time || "12:00 PM",
            imageUrl: e.imageUrl,
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
  }, [currentUser, messName, members, mealData, notices, expenses, deposits, toast, credentials])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMess() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useMess must be used within MessProvider")
  return ctx
}
