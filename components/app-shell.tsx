"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  ShoppingCart,
  Bell,
  LogOut,
  UtensilsCrossed,
} from "lucide-react"
import { useMess } from "@/components/mess-store"
import { Dashboard } from "@/components/dashboard"
import { MembersPage } from "@/components/members-page"
import { MealTracker } from "@/components/meal-tracker"
import { ExpensesPage } from "@/components/expenses-page"
import { ShoppingPage } from "@/components/shopping-page"
import { NoticesPage } from "@/components/notices-page"

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "meals", label: "Meal tracking", icon: CalendarDays },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "shopping", label: "Shopping list", icon: ShoppingCart },
  { id: "notices", label: "Notice board", icon: Bell },
] as const

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Members",
  meals: "Meal tracking",
  expenses: "Expenses",
  shopping: "Shopping list",
  notices: "Notice board",
}

export function AppShell() {
  const { currentUser, logout } = useMess()
  const [page, setPage] = useState("dashboard")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-border bg-card sm:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-card-foreground">MessHub</p>
            <p className="text-xs text-muted-foreground">Green Villa Mess</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={[
                  "mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md p-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
              {currentUser?.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">
                {currentUser?.name.split(" ")[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.role === "manager" ? "Admin" : "Member"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3.5">
          <h1 className="text-base font-medium text-card-foreground">{TITLES[page]}</h1>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary sm:hidden"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Logout
          </button>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 sm:hidden">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={[
                  "flex flex-shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-5">
          {page === "dashboard" && <Dashboard goTo={setPage} />}
          {page === "members" && <MembersPage />}
          {page === "meals" && <MealTracker />}
          {page === "expenses" && <ExpensesPage />}
          {page === "shopping" && <ShoppingPage />}
          {page === "notices" && <NoticesPage />}
        </main>
      </div>
    </div>
  )
}
