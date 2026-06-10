export type Role = "manager" | "member"

export interface Member {
  id: number
  name: string
  room: string
  join: string
  role: Role
  active: boolean
}

// Each day holds two independent meals: morning and night.
export interface DayMeals {
  morning: boolean
  night: boolean
}

export type MemberMeals = DayMeals[]

export interface ShoppingItem {
  id: number
  name: string
  done: boolean
}

export interface Notice {
  id: number
  text: string
  author: string
  time: string
}

export type ExpenseKind = "grocery" | "bill"

export interface Expense {
  id: number
  desc: string
  amount: number
  date: string
  kind: ExpenseKind
  // For grocery: which member bought the items.
  buyerId?: number
  // For bills: a label like "Electricity", "Gas", "Water".
  category?: string
}

export interface Deposit {
  id: number
  memberId: number
  amount: number
  date: string
}

export interface AuthUser {
  key: string
  name: string
  role: Role
  initials: string
  memberId: number
}

export const DAYS_IN_MONTH = 30
export const MONTH_LABEL = "June 2025"

export const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  manager: {
    password: "1234",
    user: { key: "manager", name: "Karim (Manager)", role: "manager", initials: "KM", memberId: 1 },
  },
  member1: {
    password: "1234",
    user: { key: "member1", name: "Rahim Ahmed", role: "member", initials: "RA", memberId: 2 },
  },
  member2: {
    password: "1234",
    user: { key: "member2", name: "Nasir Uddin", role: "member", initials: "NU", memberId: 3 },
  },
}

export const initialMembers: Member[] = [
  { id: 1, name: "Karim (Manager)", room: "Room 1", join: "Jan 2025", role: "manager", active: true },
  { id: 2, name: "Rahim Ahmed", room: "Room 2", join: "Jan 2025", role: "member", active: true },
  { id: 3, name: "Nasir Uddin", room: "Room 3", join: "Feb 2025", role: "member", active: true },
  { id: 4, name: "Jakir Hossain", room: "Room 4", join: "Feb 2025", role: "member", active: true },
  { id: 5, name: "Sumon Ali", room: "Room 5", join: "Mar 2025", role: "member", active: true },
  { id: 6, name: "Rony Islam", room: "Room 6", join: "Apr 2025", role: "member", active: true },
]

// Deterministic seed so morning/night vary realistically per member.
function seedMeals(seed: number): MemberMeals {
  const days: MemberMeals = []
  for (let i = 0; i < DAYS_IN_MONTH; i++) {
    const morning = (i * 7 + seed * 3) % 5 !== 0
    const night = (i * 5 + seed * 2) % 4 !== 0
    days.push({ morning, night })
  }
  return days
}

export const initialMealData: Record<number, MemberMeals> = {
  1: seedMeals(1),
  2: seedMeals(2),
  3: seedMeals(3),
  4: seedMeals(4),
  5: seedMeals(5),
  6: seedMeals(6),
}

export const initialShopping: ShoppingItem[] = [
  { id: 1, name: "Rice 10kg", done: false },
  { id: 2, name: "Lentils 2kg", done: false },
  { id: 3, name: "Cooking oil 5L", done: true },
  { id: 4, name: "Onion 3kg", done: false },
  { id: 5, name: "Potato 4kg", done: true },
  { id: 6, name: "Tomato 2kg", done: false },
]

export const initialNotices: Notice[] = [
  { id: 1, text: "Rent due by 5th June. Please pay on time.", author: "Manager", time: "2 days ago" },
  { id: 2, text: "New cook joining from Monday. Welcome Rahim bhai!", author: "Manager", time: "4 days ago" },
  { id: 3, text: "Water bill increased this month. Tk 200 extra per head.", author: "Manager", time: "1 week ago" },
  { id: 4, text: "Monthly meeting on 10th June at 9pm in common room.", author: "Manager", time: "1 week ago" },
]

export const initialExpenses: Expense[] = [
  { id: 1, desc: "Rice 10kg, lentils, oil", amount: 2100, date: "3 Jun", kind: "grocery", buyerId: 2 },
  { id: 2, desc: "Vegetables, fish, chicken", amount: 1980, date: "10 Jun", kind: "grocery", buyerId: 3 },
  { id: 3, desc: "Gas cylinder refill", amount: 1400, date: "12 Jun", kind: "bill", category: "Gas" },
  { id: 4, desc: "Beef, spices, onion", amount: 2940, date: "18 Jun", kind: "grocery", buyerId: 1 },
  { id: 5, desc: "Electricity bill", amount: 1200, date: "20 Jun", kind: "bill", category: "Electricity" },
]

export const initialDeposits: Deposit[] = [
  { id: 1, memberId: 1, amount: 3000, date: "1 Jun" },
  { id: 2, memberId: 2, amount: 2500, date: "2 Jun" },
  { id: 3, memberId: 3, amount: 2000, date: "5 Jun" },
  { id: 4, memberId: 4, amount: 3000, date: "6 Jun" },
  { id: 5, memberId: 5, amount: 1500, date: "8 Jun" },
  { id: 6, memberId: 6, amount: 2000, date: "10 Jun" },
  { id: 7, memberId: 2, amount: 1000, date: "15 Jun" },
]

// Meal counters — morning + night each count as 1 meal.
export function countMeals(meals: MemberMeals | undefined): number {
  if (!meals) return 0
  return meals.reduce((acc, d) => acc + (d.morning ? 1 : 0) + (d.night ? 1 : 0), 0)
}

export function countMorning(meals: MemberMeals | undefined): number {
  if (!meals) return 0
  return meals.reduce((acc, d) => acc + (d.morning ? 1 : 0), 0)
}

export function countNight(meals: MemberMeals | undefined): number {
  if (!meals) return 0
  return meals.reduce((acc, d) => acc + (d.night ? 1 : 0), 0)
}

export function emptyMonth(): MemberMeals {
  return Array.from({ length: DAYS_IN_MONTH }, () => ({ morning: false, night: false }))
}

// ---- Financial helpers ----

export function groceryTotal(expenses: Expense[]): number {
  return expenses.filter((e) => e.kind === "grocery").reduce((a, e) => a + e.amount, 0)
}

export function billTotal(expenses: Expense[]): number {
  return expenses.filter((e) => e.kind === "bill").reduce((a, e) => a + e.amount, 0)
}

export function depositsForMember(deposits: Deposit[], memberId: number): number {
  return deposits.filter((d) => d.memberId === memberId).reduce((a, d) => a + d.amount, 0)
}

export interface MemberFinance {
  meals: number
  mealCost: number
  billShare: number
  totalCost: number
  deposited: number
  balance: number
}

// Per-member finance: meal cost uses the per-meal rate, bills split evenly across active members.
export function memberFinance(
  memberId: number,
  members: Member[],
  mealData: Record<number, MemberMeals>,
  expenses: Expense[],
  deposits: Deposit[],
): MemberFinance {
  const totalMeals = members.reduce((a, m) => a + countMeals(mealData[m.id]), 0)
  const grocery = groceryTotal(expenses)
  const rate = totalMeals > 0 ? grocery / totalMeals : 0
  const activeCount = members.filter((m) => m.active).length || members.length || 1
  const billShare = billTotal(expenses) / activeCount

  const meals = countMeals(mealData[memberId])
  const mealCost = meals * rate
  const totalCost = mealCost + billShare
  const deposited = depositsForMember(deposits, memberId)
  return {
    meals,
    mealCost: Math.round(mealCost),
    billShare: Math.round(billShare),
    totalCost: Math.round(totalCost),
    deposited,
    balance: Math.round(deposited - totalCost),
  }
}
