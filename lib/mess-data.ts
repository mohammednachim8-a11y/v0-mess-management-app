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

export interface Expense {
  id: number
  desc: string
  amount: number
  date: string
}

export interface AuthUser {
  key: string
  name: string
  role: Role
  initials: string
}

export const DAYS_IN_MONTH = 30
export const MONTH_LABEL = "June 2025"

// Per-MEAL rate (morning and night each count as 1 meal).
export const PER_MEAL_RATE = 48.4
export const FIXED_COST_PER_HEAD = 200

export const CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  manager: {
    password: "1234",
    user: { key: "manager", name: "Karim (Manager)", role: "manager", initials: "KM" },
  },
  member1: {
    password: "1234",
    user: { key: "member1", name: "Rahim Ahmed", role: "member", initials: "RA" },
  },
  member2: {
    password: "1234",
    user: { key: "member2", name: "Nasir Uddin", role: "member", initials: "NU" },
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
  { id: 3, text: "Water bill increased this month. ৳200 extra per head.", author: "Manager", time: "1 week ago" },
  { id: 4, text: "Monthly meeting on 10th June at 9pm in common room.", author: "Manager", time: "1 week ago" },
]

export const initialExpenses: Expense[] = [
  { id: 1, desc: "Grocery — week 1", amount: 2100, date: "3 Jun" },
  { id: 2, desc: "Grocery — week 2", amount: 1980, date: "10 Jun" },
  { id: 3, desc: "Gas cylinder", amount: 1400, date: "12 Jun" },
  { id: 4, desc: "Grocery — week 3", amount: 2940, date: "18 Jun" },
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
